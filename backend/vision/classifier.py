from ultralytics import YOLO
from PIL import Image
# from backend.vision.ocr import extract_text_from_boxes

def xywhn_to_xyxy(xywhn):
    x, y, w, h = xywhn
    return (x - w/2, y - h/2, x + w/2, y + h/2)

# Returns the fraction of area of boxA that overlaps with boxB
def overlap_fractions(boxA, boxB):
    # Convert from xywhn to xyxy (normalized)
    x1A, y1A, x2A, y2A = xywhn_to_xyxy(boxA['xywhn'])
    x1B, y1B, x2B, y2B = xywhn_to_xyxy(boxB['xywhn'])
    # Intersection
    interX1, interY1 = max(x1A, x1B), max(y1A, y1B)
    interX2, interY2 = min(x2A, x2B), min(y2A, y2B)
    if interX2 <= interX1 or interY2 <= interY1:
        return (0.0, 0.0)
    interArea = (interX2 - interX1) * (interY2 - interY1)
    # Individual areas
    areaA = (x2A - x1A) * (y2A - y1A)
    areaB = (x2B - x1B) * (y2B - y1B)
    return (interArea / areaA if areaA else 0, interArea / areaB if areaB else 0)

def getBoxesFromImages(images, visionModel):
    results = visionModel(images)
    """
    Process YOLO results into custom format while preserving visualization capability,
    then remove any box that overlaps more than 20% with a higher-confidence box.
    """

    processed_results = []
    for r in results:
        boxes = r.boxes
        raw_boxes = []
        oneSided = True
        leftMin = 1
        leftMax = 0

        for box in boxes:
            xywhn = [round(x, 5) for x in box.xywhn[0].cpu().tolist()]
            conf = round(box.conf.cpu().item(), 2)
            cls_id = int(box.cls.cpu().item())
            x_center = xywhn[0]
            pos_class = 1 if x_center > 0.5 else 0

            # One sided is true if all boxes' left edges are less than 0.1 apart
            leftEdge = x_center - xywhn[2]/2
            if cls_id != 2:
                leftMin = min(leftMin, leftEdge)
                leftMax = max(leftMax, leftEdge)
                if leftMax - leftMin > 0.1:
                    oneSided = False

            raw_boxes.append({
                'xywhn': xywhn,
                'conf': conf,
                'cls': cls_id,
                'posClass': pos_class
            })

        # Filter overlapping boxes
        raw_boxes.sort(key=lambda b: b['conf'], reverse=True)
        final_boxes = []
        for b in raw_boxes:
            skip_box = False
            for fb in final_boxes:
                fracA, fracB = overlap_fractions(b, fb)
                if fracA > 0.2 or fracB > 0.2:
                    # fb has higher or equal conf since final_boxes is sorted descending
                    skip_box = True
                    break
            if not skip_box:
                final_boxes.append(b)

        # Sort final boxes by Y center for convenience
        final_boxes.sort(key=lambda x: x['xywhn'][1])
        processed_results.append({
            'boxes': final_boxes,
            'oneSided': oneSided,
        })

    return processed_results

# Usage example
if __name__ == "__main__":
    model = YOLO("backend/vision/best.pt")
    device = next(model.parameters()).device
    print(f"Inference is running on device: {device}")
    
    image_paths = ["backend/vision/dataset/raw/why-did-alexa-stop-talking-to-me-she-seemed-nice-v0-xxaq456yw7ce1.webp"]

    # 3. Get processed data
    processed_results = getBoxesFromImages(image_paths, model)
    from ocr import extract_text_from_boxes
    
    # Display bounding boxes using built-in ultralytics function
    for i, r in enumerate(model(image_paths)):
        r.plot()  # This will display the image with bounding boxes
    
    # 4. Extract text from boxes
    for i, r in enumerate(processed_results):
        # Load image
        image = Image.open(image_paths[i])
        # Extract text from boxes
        boxes = extract_text_from_boxes(image, r['boxes'])
        for b in boxes:
            print(b['text'], b['cls'])