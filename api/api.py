from flask import Flask, request
import utilities
from flask_cors import CORS
from ultralytics import YOLO
from easyocr import Reader

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Load the vision model once when the API starts
model_path = "backend/vision/best.pt"
vision_model = YOLO(model_path)
reader = Reader(['fr'], gpu=False)  # use french to handle accents


# Basic route
@app.route('/llm', methods=['POST'])
def get_llm_analysis():
    print(f"Received request: {request}")
    data = request.json
    if not data or 'conversation' not in data or 'users' not in data:
        raise Exception("Missing required parameters: conversation and users")
    conversation = data['conversation']
    users = data['users']
    json, response = utilities.getConversationAnalysis(conversation, users)
    return json

@app.route('/metadata', methods=['POST'])
def get_metadata_analysis():
    try:
        files = request.files.getlist('files')
        correctInput, fileType = checkOnReceive(request)
        
        if not correctInput:
            return {"error": "Invalid file upload"}, 400
            
        if fileType == 'text':
            metadata, conversation = utilities.getTextMetadata(files)
            img_results = None
        elif fileType == 'image':
            metadata, conversation, img_results = utilities.getImageMetadata(files, vision_model, reader)
        elif fileType == 'audio':
            return {"error": "Audio not implemented"}, 501
        else:
            return {"error": "Unsupported file type"}, 400
        return {
            "metadata": metadata,
            "conversation": conversation,
            "img_results": img_results
        }, 200

    except Exception as e:
        return {"error": str(e)}, 500

def checkOnReceive(request):
    '''Detects the type of files in the provided list of files from an HTTP POST.'''
    files = request.files.getlist('files')

    general_type = files[0].content_type.split('/')[0]

    for file in files:
        if file.content_type.split('/')[0] != general_type:
            return False, f"File type mismatch: {file.content_type} and {general_type}."
    
    return True, general_type

if __name__ == '__main__':
    app.run(debug=True)