import { spawn } from "child_process";
import path from "path";
import fs from "fs";
import apiResponse from "../utils/apiResponse.utils.js";

export const generateTranscript = async (req, res) => {

 try {

   const videoPath = "src/temp1/test.mp4";

   if(!fs.existsSync(videoPath)){

      return res.status(404).json({
        error:"Video not found"
      });

   }

   const absolutePath = path.resolve("src/temp1");

   console.log("Mounted Path :", absolutePath);


   // docker args
   const dockerArgs = [

     "run",
     "--platform",
     "linux/amd64",
     "--rm",

     "-v",
     `${absolutePath}:/data`,

     "revival-whisper",

     "python",
     "-m",
     "whisper",

     "/data/test.mp4",

     "--model",
     "small",

     "--task",
     "translate",

     "--output_format",
     "srt",

     "--output_dir",
     "/data"

   ];


   const whisperProcess = spawn("docker", dockerArgs);


   // ===== LIVE STDOUT =====

   whisperProcess.stdout.on("data",(data)=>{

      console.log("STDOUT :", data.toString());

   });


   // ===== LIVE STDERR (PROGRESS COMES HERE) =====

   whisperProcess.stderr.on("data",(data)=>{

      const output = data.toString();

      console.log("PROGRESS :", output);

      // Example parse (optional)
      const percentMatch = output.match(/(\d+)%/);

      if(percentMatch){

        console.log(
          `Video Processed : ${percentMatch[1]}%`
        );

      }

   });


   whisperProcess.on("close",(code)=>{

     console.log("Process exited with code :",code);

     if(code !== 0){

       return res.status(500).json({

         error:"Whisper Failed"

       });

     }

     const transcriptPath = path.resolve(
       "src/temp1/test.srt"
     );


     if(!fs.existsSync(transcriptPath)){

        return res.status(500).json({

          error:"Transcript not generated"

        });

     }

     const transcript = fs.readFileSync(
       transcriptPath,
       "utf-8"
     );


     return res.status(200).json(

       new apiResponse(
         200,
         { transcript },
         "Transcript Generated Successfully"
       )

     );

   });


 } catch(err){

    console.log(err);

    return res.status(500).json({

      error:"Something went wrong"

    });

 }

};