import { GetObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "../config/s3.js";
import fs from "fs";
import path from "path";
import { pipeline } from "stream/promises";
import { createWriteStream } from "fs";

const bucket = process.env.AWS_BUCKET_NAME;

/**
 * Get S3 key from full object URL (e.g. https://bucket.s3.region.amazonaws.com/key).
 */
export function getKeyFromS3Url(url) {
  try {
    const u = new URL(url);
    return u.pathname.slice(1); // remove leading /
  } catch {
    return null;
  }
}

/**
 * Download S3 object at `url` to local file `localPath`.
 * Uses AWS SDK (works for private buckets).
 */
export async function downloadFromS3Url(s3ObjectUrl, localPath) {
  const key = getKeyFromS3Url(s3ObjectUrl);
  if (!key) throw new Error("Invalid S3 URL");

  const dir = path.dirname(localPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  });

  const response = await s3.send(command);
  const stream = response.Body;
  const dest = createWriteStream(localPath);
  await pipeline(stream, dest);
  return localPath;
}
