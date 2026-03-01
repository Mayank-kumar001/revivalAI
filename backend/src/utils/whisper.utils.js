import { spawn } from "child_process";
import path from "path";
import fs from "fs";

/**
 * Run Whisper in Docker on a video file; return transcript (SRT content).
 * @param {string} absoluteVideoPath - Full path to video, e.g. .../temp3/123.mp4
 * @returns {Promise<string>} SRT transcript text
 */
export function runWhisper(absoluteVideoPath) {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(absoluteVideoPath)) {
      reject(new Error("Video not found"));
      return;
    }

    const mountDir = path.dirname(absoluteVideoPath);
    const fileName = path.basename(absoluteVideoPath);
    const baseName = path.basename(fileName, path.extname(fileName));
    const transcriptPath = path.join(mountDir, `${baseName}.srt`);

    const dockerArgs = [
      "run",
      "--platform",
      "linux/amd64",
      "--rm",
      "-v",
      `${mountDir}:/data`,
      "revival-whisper",
      "python",
      "-m",
      "whisper",
      `/data/${fileName}`,
      "--model",
      "small",
      "--task",
      "translate",
      "--output_format",
      "srt",
      "--output_dir",
      "/data",
    ];

    const whisperProcess = spawn("docker", dockerArgs);

    whisperProcess.stderr.on("data", (data) => {
      const out = data.toString();
      const percentMatch = out.match(/(\d+)%/);
      if (percentMatch) console.log(`Whisper: ${percentMatch[1]}%`);
    });

    whisperProcess.on("close", (code) => {
      if (code !== 0) {
        reject(new Error("Whisper failed"));
        return;
      }
      if (!fs.existsSync(transcriptPath)) {
        reject(new Error("Transcript not generated"));
        return;
      }
      const transcript = fs.readFileSync(transcriptPath, "utf-8");
      resolve(transcript);
    });

    whisperProcess.on("error", (err) => reject(err));
  });
}
