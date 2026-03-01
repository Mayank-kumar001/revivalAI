import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import fs from "fs";
import path from "path";
import { s3 } from "../config/s3.js";

const bucket = process.env.AWS_BUCKET_NAME;
const region = process.env.AWS_REGION || "ap-south-1";

const sanitizeFileName = (name) => name.replace(/[^a-zA-Z0-9._-]/g, "_");

export const generateUploadURL = async (fileName, fileType, userId = "anonymous") => {
  const safeName = sanitizeFileName(fileName);
  const key = `videos/${userId}/${Date.now()}-${safeName}`;

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: fileType,
  });

  const url = await getSignedUrl(s3, command, { expiresIn: 300 });
  return url;
};

/**
 * Upload a local file to S3 and return its public object URL.
 * @param {string} localFilePath - Absolute path to the file
 * @param {string} s3Key - S3 object key (e.g. reels/userId/videoId/reel_1.mp4)
 * @param {string} [contentType] - MIME type; defaults to video/mp4 for .mp4
 * @returns {Promise<string>} Public URL of the uploaded object
 */
export async function uploadFileToS3(localFilePath, s3Key, contentType) {
  const ext = path.extname(localFilePath).toLowerCase();
  const type = contentType || (ext === ".mp4" ? "video/mp4" : "application/octet-stream");

  const body = fs.createReadStream(localFilePath);

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: s3Key,
    Body: body,
    ContentType: type,
  });

  await s3.send(command);

  return `https://${bucket}.s3.${region}.amazonaws.com/${s3Key}`;
}