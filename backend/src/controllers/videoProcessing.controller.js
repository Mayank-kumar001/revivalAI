import path from "path";
import fs from "fs";
import apiResponse from "../utils/apiResponse.utils.js";
import { runWhisper } from "../utils/whisper.utils.js";

/**
 * Run Whisper on a video and return transcript.
 * Query: videoId (use temp3/{videoId}.mp4) or videoPath (relative path); default temp1/test.mp4.
 */
export const generateTranscript = async (req, res) => {
  try {
    const { videoId, videoPath } = req.query;
    let absolutePath;

    if (videoId) {
      absolutePath = path.resolve("src/temp3", `${videoId}.mp4`);
    } else if (videoPath) {
      absolutePath = path.resolve(videoPath);
    } else {
      absolutePath = path.resolve("src/temp1/test.mp4");
    }

    if (!fs.existsSync(absolutePath)) {
      return res.status(404).json({ error: "Video not found" });
    }

    const transcript = await runWhisper(absolutePath);

    return res.status(200).json(
      new apiResponse(200, { transcript }, "Transcript Generated Successfully")
    );
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: err.message || "Something went wrong",
    });
  }
};
