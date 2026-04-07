from __future__ import annotations

import re
import time
from typing import Any, Dict, Iterable, List

import numpy as np
from PIL import Image, ImageOps


def _clamp(value: int, lower: int, upper: int) -> int:
    return max(lower, min(value, upper))


def _crop_from_box(image: Image.Image, box: Dict[str, Any], padding_ratio: float = 0.015) -> Image.Image | None:
    width, height = image.size
    x, y, w, h = box["xywhn"]

    pad_x = int(width * padding_ratio)
    pad_y = int(height * padding_ratio)

    x1 = _clamp(int((x - w / 2) * width) - pad_x, 0, width)
    x2 = _clamp(int((x + w / 2) * width) + pad_x, 0, width)
    y1 = _clamp(int((y - h / 2) * height) - pad_y, 0, height)
    y2 = _clamp(int((y + h / 2) * height) + pad_y, 0, height)

    if x2 <= x1 or y2 <= y1:
        return None

    crop = image.crop((x1, y1, x2, y2))
    if crop.width < 8 or crop.height < 8:
        return None
    return crop


def _prepare_crop(crop: Image.Image) -> np.ndarray:
    grayscale = ImageOps.grayscale(crop)
    contrast = ImageOps.autocontrast(grayscale)

    if contrast.width < 320:
        scale = 320 / contrast.width
        contrast = contrast.resize(
            (max(1, int(contrast.width * scale)), max(1, int(contrast.height * scale))),
            Image.Resampling.LANCZOS,
        )

    return np.array(contrast)


def _read_text(reader: Any, crop: Image.Image) -> str:
    prepared = _prepare_crop(crop)
    result = reader.readtext(
        prepared,
        detail=0,
        paragraph=False,
        decoder="greedy",
        beamWidth=1,
        batch_size=1,
    )
    if not isinstance(result, Iterable):
        return ""
    return " ".join(fragment for fragment in result if fragment)


def extract_text_from_boxes(image: Image.Image, boxes: List[Dict[str, Any]], reader: Any):
    start_time = time.perf_counter()

    for box in boxes:
        crop = _crop_from_box(image, box)
        if crop is None:
            box["text"] = ""
            continue

        try:
            box["text"] = treatLine(_read_text(reader, crop), box["cls"])
        except Exception:
            box["text"] = ""

    print(f"OCR time: {time.perf_counter() - start_time:.2f}s")
    return boxes


def treatLine(line: str, box_class: int) -> str:
    line = " ".join(line.split()).strip()
    if not line:
        return ""

    if box_class == 2:
        return re.sub(r"[^\w\s-]", "", line).strip()

    line = re.sub(r"(\d{1,2})[.,;](\d{2})", r"\1:\2", line)
    line = re.sub(r"(\d{1,2})[.,;#!()|](\d{1,2})[.,;#!()|](\d{2,4})", r"\1/\2/\3", line)
    line = line.replace("|", "I")
    return " ".join(line.split()).strip()
