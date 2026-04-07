from __future__ import annotations

import os
import re
import sys
from functools import lru_cache
from pathlib import Path
from typing import Iterable, List, Sequence

import cv2
import numpy as np
from PIL import Image

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), "../backend"))
sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), "../backend/llm"))

from backend import local_analysis
from backend.llm import llm_analysis
from backend.vision import classifier, ocr


REPO_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_MODEL_PATH = REPO_ROOT / "backend" / "vision" / "best.pt"
DEFAULT_OCR_LANGS = tuple(
    language.strip()
    for language in os.getenv("CHATBRAIN_OCR_LANGS", "fr,en").split(",")
    if language.strip()
)
UI_NOISE_MARKERS = {
    "add to list",
    "airdrop",
    "audio",
    "block ",
    "contact info",
    "copy",
    "downloads",
    "edit",
    "encryption",
    "media, links and docs",
    "notifications",
    "recents",
    "report ",
    "search",
    "starred messages",
    "wallpaper",
    "whatsapp",
}
HEADER_NOISE_MARKERS = {
    "edit",
    "contact",
    "info",
    "lebara",
    "whatsapp",
}


@lru_cache(maxsize=1)
def get_vision_model():
    from ultralytics import YOLO

    model_path = Path(os.getenv("CHATBRAIN_MODEL_PATH", str(DEFAULT_MODEL_PATH)))
    return YOLO(str(model_path))


@lru_cache(maxsize=1)
def get_ocr_reader():
    from easyocr import Reader

    return Reader(
        list(DEFAULT_OCR_LANGS),
        gpu=os.getenv("CHATBRAIN_OCR_GPU", "false").lower() == "true",
        verbose=False,
        quantize=True,
    )


def getConversationAnalysis(conversation, users, metadata=None):
    return llm_analysis.promptToJSON(conversation, users=users, metadata=metadata)


def getTextMetadata(input_files):
    string = fileToText(input_files[-1])
    platform = local_analysis.detect_platform(string)
    metadata, conversation = local_analysis.metadata_analysis(string, "text", platform)
    return metadata, conversation


def fileToText(file):
    if isinstance(file, str):
        return file
    file_content = file.read()
    return file_content.decode("utf-8", errors="replace")


def convert_input_images(input_files: Sequence):
    converted_files = []
    if isinstance(input_files[0], str):
        for file_path in input_files:
            image = cv2.imread(file_path)
            if image is None:
                raise ValueError(f"Unable to read image file: {file_path}")
            converted_files.append(image)
        return converted_files

    for file in input_files:
        file_content = file.read()
        np_array = np.frombuffer(file_content, np.uint8)
        image = cv2.imdecode(np_array, cv2.IMREAD_COLOR)
        if image is None:
            raise ValueError(f"Unable to decode image payload: {getattr(file, 'filename', 'unknown')}")
        converted_files.append(image)
    return converted_files


def getImageMetadata(input_files, vision_model=None, reader=None):
    converted_files = convert_input_images(input_files)
    vision_model = vision_model or get_vision_model()
    reader = reader or get_ocr_reader()

    img_results = classifier.getBoxesFromImages(
        converted_files,
        vision_model,
        conf=float(os.getenv("CHATBRAIN_VISION_CONF", "0.18")),
        imgsz=int(os.getenv("CHATBRAIN_VISION_IMGSZ", "960")),
    )

    for index, img_result in enumerate(img_results):
        cv_image = converted_files[index]
        pil_image = Image.fromarray(cv2.cvtColor(cv_image, cv2.COLOR_BGR2RGB))
        img_result["boxes"] = ocr.extract_text_from_boxes(pil_image, img_result["boxes"], reader)

    contact_name = findContactName(img_results, converted_files=converted_files, reader=reader) or os.getenv(
        "CHATBRAIN_DEFAULT_CONTACT_NAME", "Other"
    )
    attributed_results = addNames(img_results, contact_name)
    metadata, conversation = compileAnalysis(attributed_results)
    return metadata, conversation, attributed_results


def compileAnalysis(attributed_results):
    compiled_metadata = {"total_messages": 0, "total_characters": 0}
    conversation_lines: List[str] = []

    for img_result in attributed_results:
        text = "\n".join(
            box["text"].strip()
            for box in img_result["boxes"]
            if box["cls"] != 2 and box["text"].strip() and not _is_ui_noise(box["text"])
        )
        img_metadata, split_conv = local_analysis.metadata_analysis(text, "image", "generic")
        if split_conv:
            conversation_lines.append(split_conv.strip())

        compiled_metadata["total_messages"] += img_metadata["total_messages"]
        compiled_metadata["total_characters"] += img_metadata["total_characters"]

        for user, data in img_metadata.items():
            if user in {"total_messages", "total_characters"}:
                continue
            if user not in compiled_metadata:
                compiled_metadata[user] = {
                    "number_messages": data["number_messages"],
                    "number_characters": data["number_characters"],
                }
                continue
            compiled_metadata[user]["number_messages"] += data["number_messages"]
            compiled_metadata[user]["number_characters"] += data["number_characters"]

    return compiled_metadata, "\n".join(line for line in conversation_lines if line).strip()


def _speaker_from_box(box, contact_name: str, conversation_side: str) -> str | None:
    if box["cls"] == 2 or not box.get("text"):
        return None

    if box["conf"] >= 0.45 and box["cls"] == 0:
        return contact_name
    if box["conf"] >= 0.45 and box["cls"] == 1:
        return "You"

    if conversation_side == "left":
        return contact_name
    if conversation_side == "right":
        return "You"

    return contact_name if box.get("side") == "left" else "You"


def _is_ui_noise(text: str) -> bool:
    stripped = text.strip()
    content = re.sub(r"^[^:]+:\s*", "", stripped)
    lowered = content.lower()
    if re.fullmatch(r"\d+\s?[a-zA-Z]", content):
        return True
    return any(marker in lowered for marker in UI_NOISE_MARKERS)


def addNames(img_results, contact_name):
    processed_results = []
    for img_result in img_results:
        processed_boxes = []
        for box in img_result["boxes"]:
            text = box.get("text", "").strip()
            speaker = _speaker_from_box(box, contact_name, img_result.get("conversationSide", "mixed"))
            box["assignedUser"] = speaker
            if speaker and text:
                box["text"] = f"{speaker}: {text}"
            else:
                box["text"] = text
            processed_boxes.append(box)

        processed_results.append(
            {
                "boxes": processed_boxes,
                "oneSided": img_result["oneSided"],
                "conversationSide": img_result.get("conversationSide", "unknown"),
            }
        )
    return processed_results


def _header_name_candidates(converted_files, reader):
    for cv_image in converted_files:
        height, width = cv_image.shape[:2]
        header = cv_image[0 : max(1, int(height * 0.18)), int(width * 0.15) : int(width * 0.85)]
        if header.size == 0:
            continue
        tokens = reader.readtext(header, detail=0, paragraph=False, decoder="greedy", beamWidth=1)
        cleaned_tokens = [
            token.strip()
            for token in tokens
            if token.strip() and token.strip().lower() not in HEADER_NOISE_MARKERS
        ]
        for token in cleaned_tokens:
            if re.fullmatch(r"[A-Za-zÀ-ÿ][A-Za-zÀ-ÿ' -]{1,40}", token):
                yield token


def findContactName(img_results, converted_files=None, reader=None):
    max_conf = -1.0
    contact_name = None
    for img_result in img_results:
        for box in img_result["boxes"]:
            text = box.get("text", "").strip()
            if box["cls"] == 2 and text and not _is_ui_noise(text) and box["conf"] > max_conf:
                max_conf = box["conf"]
                contact_name = text

    if not contact_name:
        if converted_files is not None and reader is not None:
            for candidate in _header_name_candidates(converted_files, reader):
                if not _is_ui_noise(candidate):
                    contact_name = candidate
                    break
        if not contact_name:
            return None

    cleaned = "".join(character for character in contact_name if character.isalnum() or character in {" ", "-"}).strip()
    return cleaned or None
