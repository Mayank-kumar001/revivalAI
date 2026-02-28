import path from "path";
import fs from "fs";
import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";

ffmpeg.setFfmpegPath(ffmpegPath);

export const extractAudio = (videoPath) => {
    
    const absoluteVideoPath = path.resolve(videoPath);
    console.log("PATH:", absoluteVideoPath);
    console.log("Exists:", fs.existsSync(absoluteVideoPath));

    return new Promise((resolve, reject) => {

        const outputPath = absoluteVideoPath + ".wav";

        ffmpeg(absoluteVideoPath)
            .audioCodec("pcm_s16le")
            .format("wav")
            .save(outputPath)
            .on("end", () => resolve(outputPath))
            .on("error", reject);

    });
};