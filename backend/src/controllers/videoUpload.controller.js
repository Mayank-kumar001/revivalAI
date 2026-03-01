import { generateUploadURL } from "../utils/s3.utils.js";
import { db } from "../utils/db.utils.js";
import { enqueue } from "../services/videoJobQueue.service.js";

export const getUploadURL = async (req, res) => {
  const { fileName, fileType } = req.body;
  const userId = req.user?.id ?? "anonymous";

  const url = await generateUploadURL(fileName, fileType, userId);

  res.json({ url });
};

export const saveVideo = async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: "Missing video url" });
    }

    const video = await db.video.create({
      data: {
        url,
        userId: req.user.id,
        status: "pending",
      },
    });

    enqueue({ videoId: video.id, url: video.url, userId: video.userId });
    console.log(`[video] Enqueued job for video ${video.id}`);

    res.json(video);
  } catch (error) {
    console.error(error);
    throw error;
  }
};

/** Get one video by id (own videos only). Includes url, status, transcript, reelUrls (S3 links) from DB. */
export const getVideoById = async (req, res) => {
  const videoId = parseInt(req.params.id, 10);
  if (Number.isNaN(videoId)) {
    return res.status(400).json({ error: "Invalid video id" });
  }

  const video = await db.video.findFirst({
    where: { id: videoId, userId: req.user.id },
  });

  if (!video) {
    return res.status(404).json({ error: "Video not found" });
  }

  const payload = {
    id: video.id,
    url: video.url,
    status: video.status,
    transcript: video.transcript,
    reelUrls: video.reelUrls ? JSON.parse(video.reelUrls) : [],
    createdAt: video.createdAt,
  };

  res.json(payload);
};

/** List current user's videos (includes reelUrls = S3 links from DB). */
export const getMyVideos = async (req, res) => {
  const videos = await db.video.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: "desc" },
  });

  const payload = videos.map((v) => ({
    id: v.id,
    url: v.url,
    status: v.status,
    transcript: v.transcript,
    reelUrls: v.reelUrls ? JSON.parse(v.reelUrls) : [],
    createdAt: v.createdAt,
  }));

  res.json(payload);
};