from ultralytics import YOLO
import os

def picturesToString(pictures):
    """
    This function takes a list of pictures and string representing the pictures.
    """
    concatenated = ""
    for picture in pictures:
        concatenated += picToString(picture)
    return concatenated

def picToString(picture):
    """
    This function takes a picture and returns a string representing the picture.
    """
    return picture + "\n"

