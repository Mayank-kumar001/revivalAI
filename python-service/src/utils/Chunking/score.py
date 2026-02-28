from typing import Dict, List

import os
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


def score_chunk(chunk: Dict[str, str]) -> float:
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


def score_chunks(chunks: List[Dict[str, str]]) -> List[Dict[str, float]]:
    """
    Score a list of chunks and return each with an added 'score' field.
    """
    results: List[Dict[str, float]] = []
    for chunk in chunks:
        score = score_chunk(chunk)
        results.append(
            {"start": chunk["start"], "end": chunk["end"], "text": chunk["text"], "score": score}
        )

    results.sort(key=lambda x: x["score"], reverse=True)
    return results
