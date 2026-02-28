import cv2
import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision
import urllib.request
import os

# download the face detection model if you don't have it
model_path = "blaze_face_short_range.tflite"
if not os.path.exists(model_path):
    print("downloading model...")
    urllib.request.urlretrieve(
        "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite",
        model_path
    )
    print("done")

# setup detector
base_options = python.BaseOptions(model_asset_path=model_path)
options = vision.FaceDetectorOptions(base_options=base_options)
detector = vision.FaceDetector.create_from_options(options)

cap = cv2.VideoCapture(r"C:\Users\Aadya\Pictures\Camera Roll\WIN_20260219_20_11_48_Pro.mp4")

count = 0

while True:
    ret, frame = cap.read()

    if not ret:
        break

    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb_frame)

    result = detector.detect(mp_image)

    if result.detections:
        for face in result.detections:
            box = face.bounding_box
            print(f"face at x:{box.origin_x} y:{box.origin_y} w:{box.width} h:{box.height}")
    else:
        print("no face detected")

    count += 1
    if count == 10:
        break

cap.release()