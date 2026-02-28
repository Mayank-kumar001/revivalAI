import cv2

cap = cv2.VideoCapture(r"C:\Users\Aadya\Pictures\Camera Roll\WIN_20260219_20_11_48_Pro.mp4")

count = 0

while True:
    ret, frame = cap.read()

    if not ret:
        break

    # crop the center 9:16 portion
    crop = frame[0:1080, 656:1263]

    print(crop.shape)

    count += 1
    if count == 10:
        break

cap.release()