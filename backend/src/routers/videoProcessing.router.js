import express from "express"
import { generateTranscript } from "../controllers/videoProcessing.controller.js";

export const videoProcessingRouter = express.Router();

videoProcessingRouter.get("/generateTranscript", generateTranscript);