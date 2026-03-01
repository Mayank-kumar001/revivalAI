import path from "path";
import fs from "fs";
import { downloadFromS3Url } from "../utils/downloadS3.utils.js";
import { uploadFileToS3 } from "../utils/s3.utils.js";
import { runWhisper } from "../utils/whisper.utils.js";
import { chunkScoreSrt, generateReels } from "../utils/pythonService.utils.js";
import { db } from "../utils/db.utils.js";
import { setJobProcessor } from "../services/videoJobQueue.service.js";

const TEMP3_DIR = path.resolve("src/temp3");
const OUTPUT_BASE = path.resolve(process.env.REEL_OUTPUT_DIR || "output");

async function processVideoJob(job) {
  const { videoId, url, userId } = job;
  const localVideoPath = path.join(TEMP3_DIR, `${videoId}.mp4`);
  const localSrtPath = path.join(TEMP3_DIR, `${videoId}.srt`);
  const outputDir = path.join(OUTPUT_BASE, String(videoId));

  try {
    await db.video.update({
      where: { id: videoId },
      data: { status: "processing" },
    });

    console.log(`[worker] Downloading video ${videoId} to temp3...`);
    await downloadFromS3Url(url, localVideoPath);

    console.log(`[worker] Running Whisper for video ${videoId}...`);
    const transcript = await runWhisper(localVideoPath);

    let reelUrlsJson = null;

    if (fs.existsSync(localSrtPath)) {
      console.log(`[worker] Chunking + scoring SRT for video ${videoId}...`);
      const chunkRes = await chunkScoreSrt(localSrtPath, 60, 3);
      const top = chunkRes?.top || [];

      if (top.length > 0) {
        console.log(`[worker] Generating reels for video ${videoId} (${top.length} segments)...`);
        const reelsRes = await generateReels(localVideoPath, outputDir, top);
        const localReelPaths = reelsRes?.reels || [];

        if (localReelPaths.length > 0) {
          console.log(`[worker] Uploading ${localReelPaths.length} reels to S3...`);
          const reelUrls = [];
          const uid = userId || "anonymous";
          for (let i = 0; i < localReelPaths.length; i++) {
            const localPath = localReelPaths[i];
            const fileName = path.basename(localPath);
            const s3Key = `reels/${uid}/${videoId}/${fileName}`;
            const s3Url = await uploadFileToS3(localPath, s3Key);
            reelUrls.push(s3Url);
          }
          reelUrlsJson = JSON.stringify(reelUrls);
          console.log(`[worker] Video ${videoId} reels uploaded to S3:`, reelUrls.length);
        } else {
          reelUrlsJson = JSON.stringify([]);
        }
      }
    } else {
      console.warn(`[worker] No SRT at ${localSrtPath}, skipping chunk/reels.`);
    }

    await db.video.update({
      where: { id: videoId },
      data: { status: "completed", transcript, reelUrls: reelUrlsJson },
    });

    console.log(`[worker] Video ${videoId} completed.`);
  } catch (err) {
    console.error(`[worker] Video ${videoId} failed:`, err.message);
    await db.video.update({
      where: { id: videoId },
      data: { status: "failed" },
    });
  } finally {
    for (const p of [localVideoPath, localSrtPath]) {
      if (fs.existsSync(p)) {
        try {
          fs.unlinkSync(p);
        } catch (e) {
          console.warn("[worker] Could not delete temp file:", p);
        }
      }
    }
  }
}

export function startVideoTranscriptWorker() {
  if (!fs.existsSync(TEMP3_DIR)) {
    fs.mkdirSync(TEMP3_DIR, { recursive: true });
  }
  setJobProcessor(processVideoJob);
  console.log("[worker] Video transcript worker ready.");
}
