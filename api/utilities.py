import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), '../backend'))
sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), '../backend/llm'))

from backend import chat_shrinker
from backend import local_analysis
from backend.llm import llm_analysis
from backend.vision import classifier
from backend.vision import ocr
import numpy as np
import cv2
from PIL import Image

# Text analysis

def getTextAnalysis(input_files):
    string = fileToText(input_files[-1])
    platform = local_analysis.detect_platform(string)
    metadata, conv = local_analysis.metadata_analysis(string, "text", platform)
    users = [user for user in metadata.keys() if user not in ["total_messages", "total_characters"]]
    print("Starting LLM analysis...")
    json, response = llm_analysis.promptToJSON(prompt=conv, users=users, maxOutputTokens=2000)
    return json, response

def getTextMetadata(input_files):
    string = fileToText(input_files[-1])
    platform = local_analysis.detect_platform(string)
    metadata, _ = local_analysis.metadata_analysis(string, "text", platform)
    return metadata

def fileToText(file):
    # handle fileStorage object
    if type(file) != str:
        file_content = file.read()
        return file_content.decode("utf-8")
    return file


# Image analysis

def convert_input_images(input_files):
        converted_files = []
        # if input_files is a list of filepaths instead of file objects
        if type(input_files[0]) == str:
            for file in input_files:
                image = cv2.imread(file)
                converted_files.append(image)
            return converted_files
        for file in input_files:
            file_content = file.read()
            np_array = np.frombuffer(file_content, np.uint8)
            image = cv2.imdecode(np_array, cv2.IMREAD_COLOR)
            converted_files.append(image)
        return converted_files

def getImageAnalysis(input_files, vision_model, reader):
    converted_files = convert_input_images(input_files)
    boxes_results = classifier.getBoxesFromImages(converted_files, vision_model)
    conversation = ""
    
    # Iterate through results with index
    for i, img_result in enumerate(boxes_results):
        boxes = img_result['boxes']
        one_sided = img_result['oneSided']
        
        # Convert OpenCV image to PIL Image (RGB format)
        cv_image = converted_files[i]
        pil_image = Image.fromarray(cv2.cvtColor(cv_image, cv2.COLOR_BGR2RGB))
        
        # Extract text from boxes
        text_list = ocr.extract_text_from_boxes(pil_image, boxes, reader)
    
    json, response = llm_analysis.promptToJSON(prompt=conversation, maxOutputTokens=2000)
    return json, response


def getImageMetadata(input_files, vision_model, reader):
    converted_files = convert_input_images(input_files)
    img_results = classifier.getBoxesFromImages(converted_files, vision_model)
    conversation = ""

    for i, img_result in enumerate(img_results):
        boxes = img_result['boxes']
        # convert image to format readable by OCR
        cv_image = converted_files[i]
        pil_image = Image.fromarray(cv2.cvtColor(cv_image, cv2.COLOR_BGR2RGB))
        # extract text from boxes
        img_results[i]['boxes'] = ocr.extract_text_from_boxes(pil_image, boxes, reader)
    
    contactName = findContactName(img_results)
    appended_results = addNames(img_results, contactName)
    metadata, conversation = compileAnalysis(appended_results)

    print(f"final conversation: {conversation}")
    print(f"final metadata: {metadata}")

    return metadata

def compileAnalysis(appended_results):
    """
    Combines metadata from multiple images into single analysis
    Returns (metadata_dict, conversation_string)
    """
    compiledMetadata = {
        "total_messages": 0,
        "total_characters": 0
    }
    conv = ""

    # Process each image result
    for img_result in appended_results:
        text = "\n".join(box['text'] for box in img_result['boxes'] if box['cls'] != 2)
        img_metadata, splitConv = local_analysis.metadata_analysis(text, "image", local_analysis.detect_platform(text))
        
        # Add to conversation
        conv += splitConv

        # Add counts to totals
        compiledMetadata["total_messages"] += img_metadata["total_messages"]
        compiledMetadata["total_characters"] += img_metadata["total_characters"]

        # Update per-user stats
        for user, data in img_metadata.items():
            if user not in ["total_messages", "total_characters"]:
                if user not in compiledMetadata:
                    compiledMetadata[user] = {
                        "number_messages": data["number_messages"],
                        "number_characters": data["number_characters"]
                    }
                else:
                    compiledMetadata[user]["number_messages"] += data["number_messages"]
                    compiledMetadata[user]["number_characters"] += data["number_characters"]

    return compiledMetadata, conv

def addNames(img_results, contactName):
    """appends a name at the start of a box's text depending on the posClass of the box and the oneSidedness of the image"""
    processed_results = []
    for img_result in img_results:
        processed_boxes = []
        if img_result['oneSided'] is True:
            for box in img_result['boxes']:
                box['text'] +="\n"
                processed_boxes.append(box)
        else :
            for box in img_result['boxes']:
                if box['conf'] > 0.5:
                    if box['cls'] == 0:
                        box['text'] = f"{contactName}: {box['text']}\n"
                    elif box['cls'] == 1:
                        box['text'] = f"You: {box['text']}\n"
                else:
                    if box['posClass'] == 0:
                        box['text'] = f"{contactName}: {box['text']}\n"
                    elif box['posClass'] == 1:
                        box['text'] = f"You: {box['text']}\n"
                processed_boxes.append(box)
        processed_results.append({'boxes': processed_boxes, 'oneSided': img_result['oneSided']})
    return processed_results

def buildConversation(appended_results):
    conversation = ""
    for img_result in appended_results:
        for box in img_result['boxes']:
            if box['text'] != "" and box['cls'] != 2:
                conversation += box['text']
    return conversation

def findContactName(img_results):
    """Finds the contact name in the set of images (highest conf, class 2)"""
    maxConf = 0
    contactName = None
    for img_result in img_results:
        for box in img_result['boxes']:
            if box['cls'] == 2:
                if box['conf'] > maxConf:
                    maxConf = box['conf']
                    contactName = box['text']
    # remove non-alphanumeric characters
    if contactName:
        contactName = ''.join(c for c in contactName.split() if c.isalnum())
    return contactName

if __name__ == "__main__":
    # Load image
    model_path = "backend/vision/best.pt"
    vision_model = classifier.YOLO(model_path)
    image_paths = ["backend/vision/dataset/raw/why-did-alexa-stop-talking-to-me-she-seemed-nice-v0-xxaq456yw7ce1.webp"]
    metadata = getImageMetadata(image_paths, vision_model)