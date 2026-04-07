from __future__ import annotations

from typing import Any, Dict, List


def xywhn_to_xyxy(xywhn):
    x, y, w, h = xywhn
    return (x - w / 2, y - h / 2, x + w / 2, y + h / 2)


def overlap_fractions(box_a, box_b):
    x1_a, y1_a, x2_a, y2_a = xywhn_to_xyxy(box_a["xywhn"])
    x1_b, y1_b, x2_b, y2_b = xywhn_to_xyxy(box_b["xywhn"])

    inter_x1, inter_y1 = max(x1_a, x1_b), max(y1_a, y1_b)
    inter_x2, inter_y2 = min(x2_a, x2_b), min(y2_a, y2_b)

    if inter_x2 <= inter_x1 or inter_y2 <= inter_y1:
        return 0.0, 0.0

    inter_area = (inter_x2 - inter_x1) * (inter_y2 - inter_y1)
    area_a = (x2_a - x1_a) * (y2_a - y1_a)
    area_b = (x2_b - x1_b) * (y2_b - y1_b)
    return (inter_area / area_a if area_a else 0.0, inter_area / area_b if area_b else 0.0)


def _box_side(x_center: float) -> str:
    return "right" if x_center >= 0.5 else "left"


def _conversation_side(boxes: List[Dict[str, Any]]) -> str:
    message_boxes = [box for box in boxes if box["cls"] in (0, 1)]
    if not message_boxes:
        return "unknown"

    sides = {_box_side(box["xywhn"][0]) for box in message_boxes}
    if len(sides) == 1:
        return sides.pop()
    return "mixed"


def getBoxesFromImages(images, visionModel, conf: float = 0.2, imgsz: int = 960):
    results = visionModel(images, conf=conf, imgsz=imgsz, verbose=False)
    processed_results = []

    for result in results:
        raw_boxes = []
        for box in result.boxes:
            xywhn = [round(value, 5) for value in box.xywhn[0].cpu().tolist()]
            x_center = xywhn[0]
            cls_id = int(box.cls.cpu().item())

            raw_boxes.append(
                {
                    "xywhn": xywhn,
                    "conf": round(box.conf.cpu().item(), 4),
                    "cls": cls_id,
                    "posClass": 1 if x_center >= 0.5 else 0,
                    "side": _box_side(x_center),
                }
            )

        raw_boxes.sort(key=lambda current: current["conf"], reverse=True)

        filtered_boxes = []
        for candidate in raw_boxes:
            if any(max(*overlap_fractions(candidate, kept)) > 0.35 for kept in filtered_boxes):
                continue
            filtered_boxes.append(candidate)

        filtered_boxes.sort(key=lambda current: (current["xywhn"][1], current["xywhn"][0]))

        processed_results.append(
            {
                "boxes": filtered_boxes,
                "conversationSide": _conversation_side(filtered_boxes),
                "oneSided": _conversation_side(filtered_boxes) in {"left", "right"},
            }
        )

    return processed_results
