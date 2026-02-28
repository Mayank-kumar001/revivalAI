import cv2

cap = cv2.VideoCapture(r"C:\Users\Aadya\Pictures\Camera Roll\WIN_20260219_20_11_48_Pro.mp4")

print(cap.isOpened())

while True:
    ret, frame = cap.read()

    if not ret:
        break

    print(frame.shape)

cap.release()