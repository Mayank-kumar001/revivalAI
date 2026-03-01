import express from "express";
import { authenticateUser } from "../middlewares/auth.middleware.js";
import { getUploadURL, saveVideo, getVideoById, getMyVideos } from "../controllers/videoUpload.controller.js";

export const videoUploadRouter = express.Router();

videoUploadRouter.post("/generate-upload-url", authenticateUser, getUploadURL);
videoUploadRouter.post("/save-video", authenticateUser, saveVideo);
videoUploadRouter.get("/", authenticateUser, getMyVideos);
videoUploadRouter.get("/:id", authenticateUser, getVideoById);

