FROM python:3.11-slim

RUN apt update && apt install -y ffmpeg

RUN pip install --upgrade pip
RUN pip install openai-whisper setuptools-rust

WORKDIR /app