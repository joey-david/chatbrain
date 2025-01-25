# CHATBRAIN

## Message recognition and OCR
Using Yolov11 because of how lightweight it is - only checks the image through a single pass, which allows for nearly instant classification on low resources. Finetuned it to detect chat boxes with custom built dataset.

Ultralytics YOLO11 by Glenn Jocher and Jing Qiu, version 11.0.0, 2024. Available at [https://github.com/ultralytics/ultralytics](https://github.com/ultralytics/ultralytics). ORCID: [0000-0001-5950-6979](https://orcid.org/0000-0001-5950-6979), [0000-0002-7603-6750](https://orcid.org/0000-0002-7603-6750), [0000-0003-3783-7069](https://orcid.org/0000-0003-3783-7069). Licensed under AGPL-3.0.
https://docs.ultralytics.com/modes/train/#introduction


### Custom dataset
Built a finetuning dataset from my own messages, labeled with my `backend/vision_model/labeling.py` program.

## Metrics rating and insight elaboration
### Inpersonal chat metrics
Created the `backend/local_analysis.py` pipeline, to extract message, character and contribution metrics.
### LLM Analysis
Used advanced prompt engineering to get insightful and precise evaluations of conversations.

