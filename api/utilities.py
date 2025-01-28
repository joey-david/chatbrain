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

def getTextAnalysis(input_files, start_date=None, end_date=None, start_time=None, end_time=None):
    file = input_files[-1]
    file = file.read().decode("utf-8")
    compressed_string, msgCount, n_users, user_list, nickname_list = compressFileForPlatform(file)
    print(f'Compressed string: {compressed_string}')
    print("Starting LLM analysis...")
    json, response = llm_analysis.promptToJSON(prompt=compressed_string, users=user_list, nicknames=nickname_list, maxOutputTokens=2000)
    return json, response

def getTextMetadata(input_files):
    file = input_files[-1]
    file = file.read().decode("utf-8")
    compressed_string, msgCount, n_users, user_list, nickname_list = compressFileForPlatform(file)
    metadata = local_analysis.metadata_analysis(compressed_string, user_list, nickname_list)
    print(metadata)
    return metadata

def fileToText(file):
    # if the file is not a string
    if type == 'file':
        file = file.read().decode("utf-8")
    return file

def compressFileForPlatform(file):
    platform = chat_shrinker.detect_platform(file)
    print(f"Platform detected: {platform}")
    if platform == "discord":
        return chat_shrinker.shrink_discord_chat(file, output_file="./data/discord_shrunk.txt")
    elif platform == "whatsapp":
        return chat_shrinker.shrink_whatsapp_chat(file, output_file="./data/whatsapp_shrunk.txt")
    else:
        print(f"Caution ! Platform not supported yet.")
        string = fileToText(file)
        return string, 0, 0, [], []        


# Image analysis

def convert_input_images(input_files):
        converted_files = []
        for file in input_files:
            file_content = file.read()
            np_array = np.frombuffer(file_content, np.uint8)
            image = cv2.imdecode(np_array, cv2.IMREAD_COLOR)
            converted_files.append(image)
        return converted_files

def getImageAnalysis(input_files, vision_model):
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
        text_list = ocr.extract_text_from_boxes(pil_image, boxes)
        conversation += "\n".join(text_list) + "\n"
    
    json, response = llm_analysis.promptToJSON(prompt=conversation, maxOutputTokens=2000)
    return json, response

def getImageMetadata(input_files):
    return "Not implemented yet"