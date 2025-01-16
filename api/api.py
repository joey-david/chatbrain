from flask import Flask, request
import utilities
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Basic route
@app.route('/llm', methods=['POST'])
def get_llm_analysis():
    files = request.files.getlist('files')
    correctInput, filetype = checkOnReceive(request)
    if not correctInput:
        raise Exception("Invalid file upload : checkOnReceive failed")  # Changed line
    # print the contents of the files
    if filetype == 'text':
        # process text file
        json, response = utilities.getTextAnalysis(files)
        pass
    elif filetype == 'audio':
        # process audio file
        raise NotImplementedError
    elif filetype == 'image':
        # process image file
        raise NotImplementedError
    else :
        raise Exception("Unsupported file type")
    return json

@app.route('/metadata', methods=['POST'])
def get_metadata_analysis():
    files = request.files.getlist('files')
    correctInput, fileType = checkOnReceive(request)
    if not correctInput:
        raise Exception("Invalid file upload : checkOnReceive failed")  # Changed line
    if fileType == 'text':
        response = utilities.getTextMetadata(files)
    elif fileType == 'audio':
        raise NotImplementedError
    elif fileType == 'image':
        raise NotImplementedError
    else:
        raise Exception("Unsupported file type")
    return response

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