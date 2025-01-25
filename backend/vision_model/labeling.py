import cv2
import os
import csv
import shutil
from PIL import Image
import random



import cv2
import numpy as np

def drag_annotate(img):
    """
    Returns a list of boxes in the format [x1, y1, x2, y2, box_type, index] and the scaled image.
    - img: The image to annotate (OpenCV BGR format)
    - x1, y1: Top-left corner (always ≤ x2,y2)
    - x2, y2: Bottom-right corner (always ≥ x1,y1)
    - Box type: 0 (left/other), 1 (right/user), 2 (middle/contact)
    - index: 1-based for types 0/1, always 0 for type 2
    """
    colors = {0: (0, 0, 255), 1: (0, 255, 0), 2: (0, 255, 255)}  # BGR colors
    boxes = []
    drawing = False
    box_type = None
    start_pt = (0, 0)
    last_pt = (0, 0)
    index = 1
    quit_flag = False
    
    # Normalize image height to 800 while maintaining aspect ratio
    h, w = img.shape[:2]
    new_w = int(800 * w / h)
    img = cv2.resize(img, (new_w, 800))
    display_img = img.copy()

    def mouse_handler(event, x, y, flags, param):
        nonlocal drawing, box_type, start_pt, last_pt, index
        
        x = max(0, min(x, img.shape[1]-1))  # Keep within image bounds
        y = max(0, min(y, img.shape[0]-1))
        
        if event in (cv2.EVENT_LBUTTONDOWN, cv2.EVENT_RBUTTONDOWN, cv2.EVENT_MBUTTONDOWN):
            drawing = True
            start_pt = (x, y)
            last_pt = (x, y)
            box_type = {cv2.EVENT_LBUTTONDOWN: 0,
                        cv2.EVENT_RBUTTONDOWN: 1,
                        cv2.EVENT_MBUTTONDOWN: 2}[event]
                        
        elif event == cv2.EVENT_MOUSEMOVE:
            if drawing:
                last_pt = (x, y)
                
        elif event in (cv2.EVENT_LBUTTONUP, cv2.EVENT_RBUTTONUP, cv2.EVENT_MBUTTONUP):
            if drawing:
                # Calculate normalized coordinates regardless of drag direction
                x1 = min(start_pt[0], last_pt[0])
                y1 = min(start_pt[1], last_pt[1])
                x2 = max(start_pt[0], last_pt[0])
                y2 = max(start_pt[1], last_pt[1])
                
                # Validate box size
                if (x2 - x1) > 5 and (y2 - y1) > 5:  # Minimum 5x5px
                    if box_type == 2:
                        boxes.append([x1, y1, x2, y2, box_type, 0])
                    else:
                        boxes.append([x1, y1, x2, y2, box_type, index])
                        index += 1
                else:
                    print("Box too small, ignoring...")
                    
                drawing = False

    cv2.namedWindow("Image Annotation", cv2.WINDOW_GUI_NORMAL | cv2.WINDOW_AUTOSIZE)
    cv2.setMouseCallback("Image Annotation", mouse_handler)

    while True:
        display_img = img.copy()
        overlay = img.copy()
        
        # Draw finalized boxes
        for box in boxes:
            x1, y1, x2, y2, t, idx = box
            cv2.rectangle(overlay, (x1, y1), (x2, y2), colors[t], -1)
            if t != 2:
                cv2.putText(overlay, str(idx), (x1+2, y1+15), 
                           cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255,255,255), 2)
        
        # Draw current preview box
        if drawing:
            preview_x1 = min(start_pt[0], last_pt[0])
            preview_y1 = min(start_pt[1], last_pt[1])
            preview_x2 = max(start_pt[0], last_pt[0])
            preview_y2 = max(start_pt[1], last_pt[1])
            
            cv2.rectangle(overlay, (preview_x1, preview_y1),
                         (preview_x2, preview_y2), colors[box_type], -1)
            if box_type != 2:
                cv2.putText(overlay, str(index), (preview_x1+2, preview_y1+15),
                           cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255,255,255), 2)
        
        # Blend overlay
        cv2.addWeighted(overlay, 0.3, display_img, 0.7, 0, display_img)
        cv2.imshow("Image Annotation", display_img)
        
        key = cv2.waitKey(1)
        if key == 13:  # Enter - finish
            break
        elif key == 8:  # Backspace - undo last
            if boxes:
                removed = boxes.pop()
                if removed[4] != 2:
                    index -= 1
        elif key == 27:  # Escape - quit
            quit_flag = True
            break

    cv2.destroyAllWindows()
    return boxes, img, quit_flag



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

def visualize_from_csv(file_path, csv_file):
    """Visualize the boxes from the CSV file on the image with the corresponding file name."""
    img = cv2.imread(file_path)
    file_name = file_path.split("/")[-1]
    if img is None:
        print(f"Error: Unable to load image {file_name}.")
        return
    boxes = []
    with open(csv_file, "r") as f:
        for line in f:
            if file_name in line:
                boxes = line.split(";")[1:-1]
                break
    boxes = [list(map(int, box.split(","))) for box in boxes]
    img = visualize_boxes(img, boxes)
    cv2.imshow("Image", img)
    cv2.waitKey(0)
    cv2.destroyAllWindows()



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


def organize_dataset(csv_path, src_img_dir, output_dir, train_ratio=0.8, seed=42):
    """
    Organize images and labels into YOLO format directory structure
    
    Args:
        csv_path (str): Path to CSV annotations file
        src_img_dir (str): Directory containing source images
        output_dir (str): Root directory for output dataset
        train_ratio (float): Ratio of data to use for training (0-1)
        seed (int): Random seed for reproducibility
    """
    # Create directories
    train_img_dir = os.path.join(output_dir, 'train', 'images')
    train_label_dir = os.path.join(output_dir, 'train', 'labels')
    val_img_dir = os.path.join(output_dir, 'val', 'images')
    val_label_dir = os.path.join(output_dir, 'val', 'labels')
    
    for d in [train_img_dir, train_label_dir, val_img_dir, val_label_dir]:
        os.makedirs(d, exist_ok=True)

    # Read and process CSV
    with open(csv_path, 'r') as f:
        reader = csv.reader(f, delimiter=';')
        next(reader)  # Skip header
        
        valid_entries = []
        for row in reader:
            if not row:
                continue
                
            filename = row[0].strip()
            if not filename:
                continue
                
            img_path = os.path.join(src_img_dir, filename)
            if not os.path.exists(img_path):
                print(f"Warning: Missing image {filename} - skipping")
                continue
                
            valid_entries.append((filename, row[1:]))

    # Split train/val
    random.seed(seed)
    random.shuffle(valid_entries)
    split_idx = int(len(valid_entries) * train_ratio)
    train_entries = valid_entries[:split_idx]
    val_entries = valid_entries[split_idx:]

    # Process entries
    for entries, img_dir, label_dir in [
        (train_entries, train_img_dir, train_label_dir),
        (val_entries, val_img_dir, val_label_dir)
    ]:
        for filename, boxes in entries:
            src_path = os.path.join(src_img_dir, filename)
            dst_img_path = os.path.join(img_dir, filename)
            
            # Move image
            shutil.copy(src_path, dst_img_path)
            
            # Get image dimensions
            with Image.open(src_path) as img:
                width, height = img.size
            
            # Create label file
            label_path = os.path.join(label_dir, os.path.splitext(filename)[0] + '.txt')
            with open(label_path, 'w') as f:
                for box in boxes:
                    if not box:
                        continue
                        
                    parts = box.strip().split(',')
                    if len(parts) != 6:
                        print(f"Invalid box format in {filename}: {box}")
                        continue
                        
                    try:
                        # Get coordinates from resized annotation image
                        x1 = int(parts[0])
                        y1 = int(parts[1])
                        x2 = int(parts[2])
                        y2 = int(parts[3])
                        cls_id = int(parts[4])
                    except ValueError:
                        print(f"Invalid box values in {filename}: {box}")
                        continue
                    
                    # Convert to original image coordinates
                    resized_width = int(800 * width / height)  # Same as annotation resize
                    resized_height = 800
                    
                    x1_orig = x1 * (width / resized_width)
                    x2_orig = x2 * (width / resized_width)
                    y1_orig = y1 * (height / resized_height)
                    y2_orig = y2 * (height / resized_height)
                    
                    # Calculate YOLO format with original dimensions
                    x_center = (x1_orig + x2_orig) / 2 / width
                    y_center = (y1_orig + y2_orig) / 2 / height
                    box_width = (x2_orig - x1_orig) / width
                    box_height = (y2_orig - y1_orig) / height
                    
                    # Clamp values to valid range
                    x_center = max(0.0, min(1.0, x_center))
                    y_center = max(0.0, min(1.0, y_center))
                    box_width = max(0.0, min(1.0, box_width))
                    box_height = max(0.0, min(1.0, box_height))
                    
                    # Write to label file
                    f.write(f"{cls_id} {x_center:.6f} {y_center:.6f} {box_width:.6f} {box_height:.6f}\n")

    print(f"Dataset organized successfully!")
    print(f"Train samples: {len(train_entries)}")
    print(f"Validation samples: {len(val_entries)}")
    



if __name__ == "__main__":
    # label_directory("./dataset/raw", "./dataset/labels.csv")
    # print the working directory
    # visualize_from_csv("dataset/raw/1000012011.jpeg", "dataset/labels.csv")
    organize_dataset("dataset/labels.csv", "dataset/raw", "dataset", train_ratio=0.8, seed=42)