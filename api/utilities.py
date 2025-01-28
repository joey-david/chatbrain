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

def getImageAnalysis(input_files, vision_model):
    boxes_results = classifier.getBoxesFromImages(input_files, vision_model)
    conversation = ""
    for (image, boxes) in boxes_results:
        text_list = ocr.extract_text_from_boxes(image, boxes)
        conversation += "\n".join(text_list)
    json, response = llm_analysis.promptToJSON(prompt=conversation, maxOutputTokens=2000)
    return json, response
