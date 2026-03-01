## RevivalAI – Local Development Setup

RevivalAI is a full-stack app that:
- Lets a user upload a long-form video from the browser.
- Uses Whisper (running in Docker) to generate a transcript.
- Uses a Python FastAPI microservice for SRT chunking, scoring with OpenAI, and smart-cropped reel generation.
- Stores original videos and generated reels on S3 (only S3 URLs are saved in the DB).
- Exposes a ChatGPT-style UI for managing uploads and viewing generated reels.

This guide explains how to run everything locally.

---

### 1. Project structure

- `backend/` – Node/Express API, Prisma/PostgreSQL, S3 integration, job queue, Whisper + Python-service orchestration
- `frontend/` – React + Vite SPA for authentication and video upload UI
- `python-service/` – FastAPI app for:
  - SRT parsing and chunk scoring via OpenAI (`OPENAI_API_KEY`)
  - CV-based smart cropping and reel generation using `ffmpeg`

The main services you will run:
- **PostgreSQL** database
- **Backend API** (Node on port `8080` by default)
- **Python FastAPI service** (on port `8000` by default)
- **Dockerized Whisper** (ran on-demand by the backend)
- **Frontend** (Vite dev server, usually `5173`)

---

### 2. Prerequisites

Install these locally:

- **Node.js** (LTS 18+ recommended)
- **npm** (comes with Node)
- **Python 3.11** (for `python-service`)
- **PostgreSQL** (local instance or managed, e.g. Neon)
- **Docker** (desktop/engine) – required for Whisper:
  - Must be able to run Linux containers.
- **ffmpeg**
  - Installed in the Whisper Docker image.
  - Python service uses `imageio-ffmpeg`, which bundles ffmpeg internally.

---

### 3. Environment variables

#### 3.1 Backend (`backend/.env`)

Create `backend/.env` (the example below uses a managed Neon DB – replace with your own values and **do not commit secrets**):

```env
PORT=8080
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DB_NAME?sslmode=require"

JWT_SECRET="some-long-random-secret"

AWS_REGION="ap-south-1"
AWS_ACCESS_KEY_ID="YOUR_AWS_ACCESS_KEY_ID"
AWS_SECRET_ACCESS_KEY="YOUR_AWS_SECRET_ACCESS_KEY"
AWS_BUCKET_NAME="your-s3-bucket-name"

# Where reels are written on disk before being uploaded to S3
REEL_OUTPUT_DIR="output"

# URL of the Python FastAPI service
PYTHON_SERVICE_URL="http://127.0.0.1:8000"
```

Notes:
- The S3 bucket must allow:
  - `PUT` from your backend (and from the browser via presigned URL).
  - `GET` for the generated reels, or you must use signed GET URLs.
- `REEL_OUTPUT_DIR` is where the backend writes intermediate reel files before uploading them to S3.

#### 3.2 Python service (`python-service/.env`)

Create `python-service/.env`:

```env
OPENAI_API_KEY="sk-..."
```

The Python service uses this key for chunk scoring via `gpt-3.5-turbo`.

#### 3.3 Frontend

The frontend uses a hard-coded base URL in `frontend/src/api/axios.js`:

```js
const API = axios.create({
  baseURL: "http://localhost:8080/api/v1/",
});
```

If your backend runs on a different host/port, update this accordingly.

---

### 4. Database setup (Prisma + PostgreSQL)

1. Ensure your PostgreSQL instance is running and accessible using `DATABASE_URL` in `backend/.env`.
2. From the `backend/` directory, install dependencies and run migrations:

```bash
cd backend
npm install
npx prisma migrate dev --name init
npx prisma generate
```

This creates and migrates the database schema (including `Video` with `reelUrls` storing a JSON array of S3 URLs).

---

### 5. Whisper Docker image

The backend uses `docker run` to execute Whisper in a container named **`revival-whisper`**. The corresponding Dockerfile lives in `backend/Dockerfile`:

```dockerfile
FROM python:3.11-slim

RUN apt update && apt install -y ffmpeg

RUN pip install --upgrade pip
RUN pip install openai-whisper setuptools-rust

WORKDIR /app
```

Build the image once:

```bash
cd backend
docker build -t revival-whisper .
```

Requirements:
- Docker must be installed and running.
- On macOS/Windows, Docker Desktop must be configured for Linux/amd64 (the backend uses `--platform linux/amd64`).

At runtime, the backend will:
- Mount a temp directory with the video file into the container.
- Run Whisper via `python -m whisper` to generate an `.srt`.
- Read the generated SRT file and continue processing.

---

### 6. Python FastAPI service

From the project root:

```bash
cd python-service
python -m venv .venv
source .venv/bin/activate      # On Windows: .venv\Scripts\activate

pip install --upgrade pip
pip install -r requirements.txt    # If you add one
```

If there is no `requirements.txt`, install at least:

```bash
pip install fastapi uvicorn python-dotenv openai imageio-ffmpeg opencv-python
```

Run the service:

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

Endpoints (used by the backend):
- `POST /chunk/score-srt` – parses SRT, chunks and scores with OpenAI.
- `POST /cv/generate-reels` – smart-crops and cuts reels for the top segments.

Make sure:
- `PYTHON_SERVICE_URL` in `backend/.env` points to this service (e.g. `http://127.0.0.1:8000`).

---

### 7. Backend API (Node/Express)

From the project root:

```bash
cd backend
npm install        # if not already done
npm run dev        # starts on PORT (8080 by default)
```

Key responsibilities:
- Authentication (JWT).
- Generating S3 presigned URLs for uploads.
- Persisting `Video` records in PostgreSQL (`status`, `url`, `reelUrls`, etc.).
- Managing a background job queue (`videoJobQueue.service.js`).
- For each uploaded video:
  - Downloads from S3.
  - Runs Whisper in Docker to generate SRT.
  - Calls Python FastAPI service for chunk scoring and reel generation.
  - Uploads generated reels to S3 and saves **S3 URLs** in `reelUrls`.

Ensure:
- Docker is running (for Whisper).
- Python service is reachable (for chunking + reel generation).

---

### 8. Frontend (React + Vite)

From the project root:

```bash
cd frontend
npm install
npm run dev
```

This starts the Vite dev server (by default `http://localhost:5173`).

Features:
- Auth pages (`/login`, `/signup`).
- Main `Upload` page (ChatGPT-style layout):
  - Left sidebar listing video “chats” (uploads) with status.
  - Main panel for drag-and-drop upload + progress.
  - After upload, a new sidebar entry is created and status is polled.
  - Once processing is complete, S3 reel URLs are shown with “Open” buttons.

Make sure:
- The browser can reach the backend at `http://localhost:8080/api/v1/` (CORS must be allowed by the backend).

---

### 9. Running everything together

Recommended order:

1. **PostgreSQL** – start local DB or ensure your cloud DB is reachable.
2. **Docker** – make sure Docker Desktop/daemon is running.
3. **Build Whisper image** (first time only):

   ```bash
   cd backend
   docker build -t revival-whisper .
   ```

4. **Python service**:

   ```bash
   cd python-service
   # activate venv
   uvicorn main:app --host 0.0.0.0 --port 8000 --reload
   ```

5. **Backend API**:

   ```bash
   cd backend
   npm run dev
   ```

6. **Frontend**:

   ```bash
   cd frontend
   npm run dev
   ```

7. Navigate to the frontend URL (e.g. `http://localhost:5173`), sign up/login, and start uploading videos.

---

### 10. Troubleshooting

- **Whisper / Docker not found**
  - Ensure Docker is installed and running.
  - Confirm the image exists: `docker images | grep revival-whisper`.
  - Rebuild if necessary: `docker build -t revival-whisper .` in `backend/`.

- **Python service connection errors**
  - Ensure `uvicorn main:app --port 8000` is running.
  - Check `PYTHON_SERVICE_URL` in `backend/.env`.

- **S3 upload issues**
  - Verify AWS credentials and bucket name in `backend/.env`.
  - Check bucket CORS to allow browser PUT requests via presigned URLs.

- **Database errors**
  - Verify `DATABASE_URL` is correct and DB is reachable.
  - Re-run `npx prisma migrate dev` and `npx prisma generate` in `backend/`.

---

This should be enough to get RevivalAI running locally with the backend, frontend, Python microservice, and Dockerized Whisper all working together. 

