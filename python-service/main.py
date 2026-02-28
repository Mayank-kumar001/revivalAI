from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv
from typing import List

from src.utils.Chunking.parse_srt import parse_srt, group_into_chunks
from src.utils.Chunking.score import score_chunks
from src.utils.CV.smartCrop import smart_crop_video
from src.utils.CV.reels import generate_reels

load_dotenv()


app = FastAPI()


class ChunkingRequest(BaseModel):
    srt_path: str
    chunk_seconds: int = 60
    top_n: int = 3


class SmartCropRequest(BaseModel):
    input_path: str
    output_path: str | None = None
    fps: float | None = None


class Segment(BaseModel):
    start: str
    end: str
    text: str
    score: float


class GenerateReelsRequest(BaseModel):
    input_path: str
    segments: List[Segment]
    output_dir: str | None = None


@app.get("/")
def home():
    return {"hello": "world"}


@app.post("/chunk/score-srt")
def score_srt(req: ChunkingRequest):
    subtitles = parse_srt(req.srt_path)
    chunks = group_into_chunks(subtitles, chunk_seconds=req.chunk_seconds)
    scored = score_chunks(chunks)
    return {
        "top": scored[: req.top_n],
        "all": scored,
    }


@app.post("/cv/smart-crop")
def cv_smart_crop(req: SmartCropRequest):
    output_path = smart_crop_video(
        input_path=req.input_path,
        output_path=req.output_path,
        fps=req.fps,
    )
    return {"output_path": output_path}


@app.post("/cv/generate-reels")
def cv_generate_reels(req: GenerateReelsRequest):
    try:
        paths = generate_reels(
            input_path=req.input_path,
            segments=[s.dict() for s in req.segments],
            output_dir=req.output_dir,
        )
    except FileNotFoundError as e:
        # e.g. input video not found or invalid output dir
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        # surface any other error message to the client for easier debugging
        raise HTTPException(status_code=500, detail=str(e))

    return {"reels": paths}
