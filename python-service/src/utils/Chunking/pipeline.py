from typing import Dict, List

from openai import OpenAI

from .parse_srt import parse_srt, group_into_chunks
from .score import score_chunks

client = OpenAI()


def _score_chunk_text(chunk: Dict[str, str]) -> float:
    prompt = f"""
You are a social media virality expert. Score the following transcript chunk out of 10 based on:
- How engaging or exciting it is
- Whether it could hook a viewer in the first 3 seconds
- Viral potential for short video reels

Respond with ONLY a number between 1 and 10. Nothing else.

Transcript: {chunk['text']}
"""
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[{"role": "user", "content": prompt}]
    )
    score = float(response.choices[0].message.content.strip())
    return score


def score_srt_file(file_path: str, chunk_seconds: int = 60) -> List[Dict[str, float]]:
    """
    High-level helper to go from an SRT file on disk
    to a list of scored chunks sorted by score desc.
    """
    subtitles = parse_srt(file_path)
    chunks = group_into_chunks(subtitles, chunk_seconds=chunk_seconds)
    return score_chunks(chunks)
