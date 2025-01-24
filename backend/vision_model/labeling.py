import tkinter as tk
from tkinter import filedialog
import cv2
import numpy as np
import os



def drag_annotate(img):
    """
    Returns a list of boxes in the format [x1, y1, x2, y2, box_type, index] and the scaled image.
    - Box type is 0 for left click, 1 for right click, 2 for middle click.
    - x1, y1 is the top left corner of the box and x2, y2 is the bottom right corner.
    - img: The image to annotate.
    - index: The index of the rectangle (1-based for red and green, always 0 for yellow).
    """
    colors = {0: (0, 0, 255), 1: (0, 255, 0), 2: (0, 255, 255)}
    boxes = []
    drawing = False
    box_type = None
    start_pt = (0, 0)
    last_x, last_y = 0, 0
    index = 1
    quit = False
    
    # Normalize image to height 800
    img = cv2.resize(img, (int(800 * img.shape[1] / img.shape[0]), 800))

    def mouse_handler(event, x, y, _flags, _param):
        nonlocal drawing, box_type, start_pt, last_x, last_y, index
        if event in (cv2.EVENT_LBUTTONDOWN, cv2.EVENT_RBUTTONDOWN, cv2.EVENT_MBUTTONDOWN):
            drawing = True
            start_pt = (x, y)
            last_x, last_y = x, y
            box_type = 0 if event == cv2.EVENT_LBUTTONDOWN else (1 if event == cv2.EVENT_RBUTTONDOWN else 2)
        elif event == cv2.EVENT_MOUSEMOVE:
            if drawing:
                last_x, last_y = x, y
        elif event in (cv2.EVENT_LBUTTONUP, cv2.EVENT_RBUTTONUP, cv2.EVENT_MBUTTONUP):
            if drawing:
                if box_type == 2:
                    boxes.append([start_pt[0], start_pt[1], x, y, box_type, 0])
                else:
                    boxes.append([start_pt[0], start_pt[1], x, y, box_type, index])
                    index += 1
            drawing = False

    cv2.namedWindow("Image", cv2.WINDOW_GUI_NORMAL)
    cv2.setMouseCallback("Image", mouse_handler)
    cv2.resizeWindow("Image", img.shape[1], img.shape[0])

    while True:
        temp = img.copy()
        overlay = temp.copy()
        for x1, y1, x2, y2, t, idx in boxes:
            cv2.rectangle(overlay, (x1, y1), (x2, y2), colors[t], -1)
            if t != 2:
                cv2.putText(overlay, str(idx), (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, colors[t], 2)
        if drawing:
            cv2.rectangle(overlay, start_pt, (last_x, last_y), colors[box_type], -1)
            if box_type != 2:
                cv2.putText(overlay, str(index), (start_pt[0], start_pt[1] - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, colors[box_type], 2)
        cv2.addWeighted(overlay, 0.4, temp, 0.6, 0, temp)
        key = cv2.waitKey(1) & 0xFF
        cv2.imshow("Image", temp)
        if key == 13:  # Enter
            break
        elif key == 8:  # Backspace
            if boxes:
                removed_box = boxes.pop()
                if removed_box[4] != 2:
                    index -= 1
        elif key == 27:  # Escape
            quit = True
            break

    cv2.destroyAllWindows()
    return boxes, img, quit



def visualize_boxes(img, boxes):
    """Visualize the boxes on the image."""
    colors = {0: (0, 0, 255), 1: (0, 255, 0), 2: (0, 255, 255)}
    if img.shape[0] != 800:
        img = cv2.resize(img, (int(800 * img.shape[1] / img.shape[0]), 800))
    for x1, y1, x2, y2, t, idx in boxes:
        cv2.rectangle(img, (x1, y1), (x2, y2), colors[t], 2)
        if t != 2:
            cv2.putText(img, str(idx), (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, colors[t], 2)
    return img



def add_to_csv(file_path, boxes, output_file):
    """Add the boxes to the CSV file with the corresponding file name."""
    file_name = file_path.split("/")[-1]
    # if the file is empty, add the header
    if not os.path.exists(output_file) or os.path.getsize(output_file) == 0:
        with open(output_file, "w") as f:
            f.write("filename;boxes\n")
    with open(output_file, "a") as f:  # Changed "w" to "a" to append to the file instead of overwriting it
        f.write(file_name + ";")
        for box in boxes:
            f.write(','.join(map(str, box)) + ';')
        f.write("\n")



def label_directory(source_directory, target_csv, maxNumBoxes=0):
    """Label all images in the source directory and save the labeled images and labels in the target directory.
    - source_directory: The directory containing the images to label.
    The saved images are resized to height 800, and renamed to image_0.png, image_1.png, etc."""
    # Preparation
    if os.path.exists(target_csv):
        with open(target_csv, "r") as f:
            imageCount = len(f.readlines()) - 1
    else:
        with open(target_csv, "w") as f:
            f.write("filename;boxes\n")
        imageCount = 0
    # Main loop
    for file in os.listdir(source_directory):
        filepath = os.path.join(source_directory, file)
        filename = filepath.split("/")[-1]
        if (any(file.lower().endswith(ext) for ext in (".png", ".jpg", ".jpeg", ".bmp", ".tiff", ".webp")) 
                and not any(filename in line for line in open(target_csv))):
            img = cv2.imread(filepath)
            if img is None:
                print(f"Error: Unable to load image {file}.")
                continue
            boxes, mod_img, quit = drag_annotate(img)
            if quit:
                break
            maxNumBoxes = max(maxNumBoxes, len(boxes))
            add_to_csv(filename, boxes, target_csv)
            imageCount += 1
            print(f"You've labeled {round(imageCount / len(os.listdir(source_directory))*100, 2)}% of the images.")
    
    return maxNumBoxes, imageCount



if __name__ == "__main__":
    label_directory(os.path.expanduser("~/Pictures/Screenshots"), "./data/labels.csv")