from __future__ import annotations

import argparse
import json
import sys
import time
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[1]
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from api import utilities


DEFAULT_IMAGE_GLOB = "chatbrain/src/assets/tutorialImage*.png"


def benchmark(image_paths):
    vision_model = utilities.get_vision_model()
    reader = utilities.get_ocr_reader()

    timings = []
    results = []

    for image_path in image_paths:
        start = time.perf_counter()
        metadata, conversation, img_results = utilities.getImageMetadata([str(image_path)], vision_model, reader)
        elapsed = time.perf_counter() - start

        assigned_users = sorted(
            key
            for key in metadata.keys()
            if key not in {"total_messages", "total_characters"}
        )

        timings.append(elapsed)
        results.append(
            {
                "image": image_path.name,
                "seconds": round(elapsed, 3),
                "users": assigned_users,
                "metadata": metadata,
                "conversation_preview": conversation[:400],
            }
        )

    summary = {
        "count": len(results),
        "avg_seconds": round(sum(timings) / max(1, len(timings)), 3),
        "max_seconds": round(max(timings) if timings else 0.0, 3),
        "results": results,
    }
    return summary


def main():
    parser = argparse.ArgumentParser(description="Benchmark ChatBrain screenshot analysis")
    parser.add_argument(
        "--images",
        nargs="*",
        help="Specific image paths to benchmark. Defaults to bundled tutorial screenshots.",
    )
    args = parser.parse_args()

    if args.images:
        image_paths = [Path(path).resolve() for path in args.images]
    else:
        repo_root = Path(__file__).resolve().parents[1]
        image_paths = sorted(repo_root.glob(DEFAULT_IMAGE_GLOB))

    if not image_paths:
        raise SystemExit("No benchmark images found.")

    print(json.dumps(benchmark(image_paths), indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
