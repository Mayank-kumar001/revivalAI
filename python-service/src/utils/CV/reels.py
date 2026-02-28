"""
Generate mobile-view (9:16) reels from ranked intervals.

Pipeline:
1. Smart-crop the full input video (face detection + 9:16 crop)
2. Cut each segment from the smart-cropped output using ffmpeg
"""

from __future__ import annotations

from pathlib import Path
from typing import Iterable, List, TypedDict

import imageio_ffmpeg
import subprocess

from .smartCrop import smart_crop_video


class Segment(TypedDict):
    start: str
    end: str
    text: str
    score: float


def generate_reels(
    input_path: str,
    segments: Iterable[Segment],
    output_dir: str | None = None,
) -> List[str]:
    """
    For each ranked interval:
    1. Smart-crop full video (face detection + 9:16 mobile view)
    2. Cut each segment from that output

    Returns list of output reel paths.
    """
    input_file = Path(input_path)
    if not input_file.exists():
        raise FileNotFoundError(f"Input video not found: {input_file}")

    if output_dir is not None:
        out_dir = Path(output_dir)
        out_dir.mkdir(parents=True, exist_ok=True)
        smartcrop_path = out_dir / f"{input_file.stem}_smartcrop.mp4"
    else:
        out_dir = input_file.parent
        smartcrop_path = out_dir / f"{input_file.stem}_smartcrop.mp4"

    # Step 1: Face-detect + crop to 9:16 mobile view (full video)
    print(f"[reels] smart cropping (face track + 9:16): {input_file} -> {smartcrop_path}")
    smart_cropped = smart_crop_video(str(input_file), output_path=str(smartcrop_path))

    # Step 2: Cut each interval from the smart-cropped video
    ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
    reel_paths: List[str] = []

    for idx, seg in enumerate(segments, start=1):
        reel_file = out_dir / f"{input_file.stem}_reel_{idx}.mp4"

        # Video from smart-cropped (no audio), audio from original - mux together
        cmd = [
            ffmpeg_exe,
            "-y",
            "-ss", seg["start"],
            "-to", seg["end"],
            "-i", smart_cropped,
            "-ss", seg["start"],
            "-to", seg["end"],
            "-i", str(input_file),
            "-map", "0:v",
            "-map", "1:a?",
            "-c:v", "copy",
            "-c:a", "aac",
            "-shortest",
            str(reel_file),
        ]

        print(f"[reels] cutting reel {idx} (video + audio): {seg['start']} -> {seg['end']}")
        completed = subprocess.run(cmd, capture_output=True, text=True)
        if completed.returncode != 0:
            # Fallback: video only if source has no audio
            cmd_fallback = [
                ffmpeg_exe, "-y",
                "-ss", seg["start"], "-to", seg["end"],
                "-i", smart_cropped,
                "-c", "copy",
                str(reel_file),
            ]
            completed = subprocess.run(cmd_fallback, capture_output=True, text=True)
            if completed.returncode != 0:
                print(f"[reels] ffmpeg error for segment {idx}: {completed.stderr}")
                continue

        reel_paths.append(str(reel_file))
        print(f"[reels] created: {reel_file}")

    return reel_paths
