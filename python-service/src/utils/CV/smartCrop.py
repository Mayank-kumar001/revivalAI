from pathlib import Path
from typing import Optional

import cv2
import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision

MODEL_URL = "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite"


def _ensure_model(model_path: Path) -> Path:
    """Download face model if missing."""
    if not model_path.exists():
        import urllib.request
        print(f"[smart_crop] downloading face model to {model_path}...")
        model_path.parent.mkdir(parents=True, exist_ok=True)
        urllib.request.urlretrieve(MODEL_URL, str(model_path))
        print("[smart_crop] model downloaded")
    return model_path


def smart_crop_video(
    input_path: str,
    output_path: Optional[str] = None,
    fps: float | None = None,
) -> str:
    """
    Crop a horizontal video into a smooth-follow 9:16 vertical frame
    that tracks the main face using MediaPipe.
    """
    input_file = Path(input_path)
    if not input_file.exists():
        raise FileNotFoundError(f"Input video not found: {input_file}")

    model_path = Path(__file__).with_name("blaze_face_short_range.tflite")
    model_path = _ensure_model(model_path)

    cap = cv2.VideoCapture(str(input_file))
    if not cap.isOpened():
        raise RuntimeError(f"Unable to open video at {input_file}")

    frame_width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    frame_height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    video_fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
    if fps is None:
        fps = video_fps

    # 9:16 width for given height
    crop_width = int(frame_height * 9 / 16)

    if output_path is None:
        output_file = input_file.with_name(f"{input_file.stem}_smartcrop.mp4")
    else:
        output_file = Path(output_path)

    # setup detector
    base_options = python.BaseOptions(model_asset_path=str(model_path))
    options = vision.FaceDetectorOptions(base_options=base_options)
    detector = vision.FaceDetector.create_from_options(options)

    fourcc = cv2.VideoWriter_fourcc(*"mp4v")
    out = cv2.VideoWriter(str(output_file), fourcc, fps, (crop_width, frame_height))

    smooth_x = frame_width // 2  # start from center

    print(f"[smart_crop] starting: {input_file}")
    try:
        while True:
            ret, frame = cap.read()
            if not ret:
                break

            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb_frame)
            result = detector.detect(mp_image)

            if result.detections:
                box = result.detections[0].bounding_box
                face_center_x = box.origin_x + box.width // 2
                smooth_x = int(0.9 * smooth_x + 0.1 * face_center_x)

            x1 = smooth_x - crop_width // 2
            x1 = max(0, min(x1, frame_width - crop_width))
            x2 = x1 + crop_width

            cropped = frame[0:frame_height, x1:x2]
            out.write(cropped)
    finally:
        cap.release()
        out.release()
        print(f"[smart_crop] done, wrote: {output_file}")

    return str(output_file)