import easyocr
from PIL import Image
import time
import numpy as np
import re

def extract_text_from_boxes(image, boxes, reader):
    """Modifies the boxes to include a 'content' field with the extracted text."""
    start_time = time.time()
    width, height = image.size
    
    for box in boxes:
        x, y, w, h = box['xywhn']
        x1, x2, y1, y2 = int((x - w/2) * width), int((x + w/2) * width), int((y - h/2) * height), int((y + h/2) * height)
        try:
            cropped_image = image.crop((x1, y1, x2, y2))
            cropped_image_np = np.array(cropped_image)  # Convert PIL image to numpy array
            result = reader.readtext(cropped_image_np)
            text = " ".join([res[1] for res in result])
            box['text'] = treatLine(text, box['cls'])
        except Exception as e:
            print(f"Error processing box: {e}")
            box['text'] = ""
        if x1 < 0 or y1 < 0 or x2 > width or y2 > height:
            print(f"Invalid box dimensions: x1={x1}, y1={y1}, x2={x2}, y2={y2}")
            box['text'] = ""
            
    end_time = time.time()
    print(f"OCR Time taken : {round(end_time - start_time, 2)} seconds")
    return boxes

def treatLine(line, box_class):
    """Returns a string with:
    - no double spaces
    - no leading or trailing spaces
    - fixed date/time format
    - if class is 2 (contact), remove and non-alphanumeric characters (leave spaces)"""
    if box_class == 2:
        line = re.sub(r'[^\w\s]', '', line).strip()  # Remove all non-alphanumeric characters except spaces
    else:
        # Fix time format
        line = re.sub(r'(\d{1,2})[.,;](\d{2})', r'\1:\2', line)
        # Fix date format
        line = re.sub(r'(\d{1,2})[.,;#!\()|](\d{1,2})[.,;#!\()|](\d{2,4})', r'\1/\2/\3', line)
        line = " ".join(line.split()).strip()
    return line

if __name__ == "__main__":
    # Load image
    reader = easyocr.Reader(['fr'], gpu=False)
    # prompt the user to upload an image
    image = Image.open("chatbrain/src/assets/tutorialImage8.png")
    boxes = [{'xywhn': [0.5, 0.5, 0.5, 0.5], 'conf': 0.99, 'cls': 0}]
    boxes = extract_text_from_boxes(image, boxes, reader)