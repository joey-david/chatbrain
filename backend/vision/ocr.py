import easyocr
from PIL import Image
import time
import numpy as np
import re

def extract_text_from_boxes(image, boxes):
    """Returns a single string extracted from the image using the provided bounding boxes."""
    start_time = time.time()
    text_list = []
    width, height = image.size
    reader = easyocr.Reader(['fr'])  # use french to handle accents
    
    for box in boxes:
        x, y, w, h = box['xywhn']
        x1, x2, y1, y2 = int((x - w/2) * width), int((x + w/2) * width), int((y - h/2) * height), int((y + h/2) * height)
        try:
            cropped_image = image.crop((x1, y1, x2, y2))
            cropped_image_np = np.array(cropped_image)  # Convert PIL image to numpy array
            result = reader.readtext(cropped_image_np)
            text = " ".join([res[1] for res in result])
            text_list.append(treatLine(text))
        except Exception as e:
            print(f"Error processing box: {e}")
            text_list.append("")
        if x1 < 0 or y1 < 0 or x2 > width or y2 > height:
            print(f"Invalid box dimensions: x1={x1}, y1={y1}, x2={x2}, y2={y2}")
            text_list.append("")
            
    end_time = time.time()
    print(f"OCR Time taken : {round(end_time - start_time, 2)} seconds")
    return text_list


def treatLine(line):
    """Returns a string with:
    - no double spaces
    - no leading or trailing spaces
    - fixed date/time format"""
    # Fix time format
    line = re.sub(r'(\d{1,2})[.,;](\d{2})', r'\1:\2', line)
    # Fix date format
    line = re.sub(r'(\d{1,2})[.,;#!\()|](\d{1,2})[.,;#!\()|](\d{2,4})', r'\1/\2/\3', line)
    return " ".join(line.split()).strip()
    


if __name__ == "__main__":
    # Load image
    string = "Axolotl Yesterday at 7.25 PM Je savais pas qu'elles étaient aussi bien vues"
    
    print(treatLine(string))