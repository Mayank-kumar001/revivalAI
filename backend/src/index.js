import express from "express";
import "dotenv/config";
import cors from "cors";
import { startVideoTranscriptWorker } from "./workers/videoTranscript.worker.js";

const app = express();
app.use(cors());
app.use(express.json());
const port = process.env.PORT;

startVideoTranscriptWorker();

app.get("/", (req, res) => {
  res.send("Hello World!");
});


// importing routes
import {healthCheckRouter} from "./routers/healthCheck.router.js";
import { videoProcessingRouter } from "./routers/videoProcessing.router.js";
import { authRouter } from "./routers/auth.router.js";
import { videoUploadRouter } from "./routers/videoUpload.router.js";
app.use("/api/v1/auth", authRouter);  
app.use("/api/v1/healthCheck", healthCheckRouter);  
app.use("/api/v1/process", videoProcessingRouter);  
app.use("/api/v1/video", videoUploadRouter);  

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});