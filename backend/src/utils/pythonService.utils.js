/**
 * Call Python microservice: chunk/score-srt and cv/generate-reels.
 * Uses absolute paths so Python (and ffmpeg) can read/write files.
 */

import path from "path";

const BASE_URL = process.env.PYTHON_SERVICE_URL || "http://127.0.0.1:8000";

/** Normalize path for Python (forward slashes). */
function toPythonPath(p) {
  return path.resolve(p).replace(/\\/g, "/");
}

async function post(endpoint, body) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Python service ${endpoint}: ${res.status} ${text}`);
  }
  return res.json();
}

/**
 * Chunk SRT and get top scored segments.
 * @param {string} srtPath - Absolute path to .srt file
 * @param {number} chunkSeconds - Chunk size in seconds
 * @param {number} topN - Number of top segments to return
 * @returns {{ top: Array<{ start, end, text, score }>, all: Array }}
 */
export async function chunkScoreSrt(srtPath, chunkSeconds = 60, topN = 3) {
  return post("/chunk/score-srt", {
    srt_path: toPythonPath(srtPath),
    chunk_seconds: chunkSeconds,
    top_n: topN,
  });
}

/**
 * Smart-crop video and cut reels for each segment.
 * @param {string} inputPath - Absolute path to video file
 * @param {string} outputDir - Absolute path to output directory
 * @param {Array<{ start, end, text, score }>} segments - From chunk/score-srt "top"
 * @returns {{ reels: string[] }} Paths to generated reel files
 */
export async function generateReels(inputPath, outputDir, segments) {
  return post("/cv/generate-reels", {
    input_path: toPythonPath(inputPath),
    output_dir: toPythonPath(outputDir),
    segments,
  });
}
