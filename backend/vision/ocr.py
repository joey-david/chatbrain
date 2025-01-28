import easyocr
from PIL import Image
import time
import numpy as np

def extract_text_from_boxes(image, boxes):
    """Returns a single string extracted from the image using the provided bounding boxes."""
    start_time = time.time()
    text_list = []
    width, height = image.size
    reader = easyocr.Reader(['fr'])  # use french to handle accents
    
    for box in boxes:
        x, y, w, h = box['xywhn']
        x_pixel = int(x * width)
        y_pixel = int(y * height)
        w_pixel = int(w * width)
        h_pixel = int(h * height)
        
        # Clamp coordinates
        x1 = max(0, x_pixel - w_pixel//2)
        y1 = max(0, y_pixel - h_pixel//2)
        x2 = min(width, x_pixel + w_pixel//2)
        y2 = min(height, y_pixel + h_pixel//2)
        
        # Only process if we have a valid box
        if x2 > x1 and y2 > y1:
            try:
                cropped_image = image.crop((x1, y1, x2, y2))
                cropped_image_np = np.array(cropped_image)  # Convert PIL image to numpy array
                result = reader.readtext(cropped_image_np)
                text = " ".join([res[1] for res in result])
                text_list.append(text.strip())
            except Exception as e:
                print(f"Error processing box: {e}")
                text_list.append("")
        else:
            print(f"Invalid box dimensions: x1={x1}, y1={y1}, x2={x2}, y2={y2}")
            text_list.append("")
            
    end_time = time.time()
    print(f"OCR Time taken : {round(end_time - start_time, 2)} seconds")
    return text_list