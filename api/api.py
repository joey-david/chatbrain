from __future__ import annotations

import os
from pathlib import Path

from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS

try:
    from . import utilities
except ImportError:
    import utilities


REPO_ROOT = Path(__file__).resolve().parents[1]
FRONTEND_DIST = REPO_ROOT / "chatbrain" / "dist"


def create_app():
    app = Flask(__name__, static_folder=None)
    app.config["MAX_CONTENT_LENGTH"] = int(os.getenv("CHATBRAIN_MAX_UPLOAD_BYTES", str(20 * 1024 * 1024)))
    CORS(app)

    @app.get("/healthz")
    def healthcheck():
        return jsonify({"ok": True})

    @app.post("/llm")
    def get_llm_analysis():
        data = request.get_json(silent=True) or {}
        conversation = data.get("conversation", "")
        users = data.get("users", [])
        metadata = data.get("metadata")

        if not conversation or not isinstance(users, list):
            return jsonify({"error": "Missing required parameters: conversation and users"}), 400

        try:
            analysis = utilities.getConversationAnalysis(conversation, users, metadata=metadata)
        except Exception as exc:
            return jsonify({"error": str(exc)}), 500
        return jsonify(analysis)

    @app.post("/metadata")
    def get_metadata_analysis():
        try:
            files = request.files.getlist("files")
            correct_input, file_type = checkOnReceive(files)
            if not correct_input:
                return jsonify({"error": file_type}), 400

            if file_type == "text":
                metadata, conversation = utilities.getTextMetadata(files)
                img_results = None
            elif file_type == "image":
                metadata, conversation, img_results = utilities.getImageMetadata(files)
            elif file_type == "audio":
                return jsonify({"error": "Audio not implemented"}), 501
            else:
                return jsonify({"error": "Unsupported file type"}), 400

            return (
                jsonify(
                    {
                        "metadata": metadata,
                        "conversation": conversation,
                        "img_results": img_results,
                    }
                ),
                200,
            )
        except Exception as exc:
            return jsonify({"error": str(exc)}), 500

    @app.get("/assets/<path:path>")
    def serve_assets(path):
        assets_dir = FRONTEND_DIST / "assets"
        if assets_dir.exists():
            return send_from_directory(assets_dir, path)
        return jsonify({"error": "Frontend assets not found"}), 404

    @app.get("/favicon.ico")
    def serve_favicon():
        favicon = FRONTEND_DIST / "favicon.ico"
        if favicon.exists():
            return send_from_directory(FRONTEND_DIST, "favicon.ico")
        return ("", 204)

    @app.get("/")
    @app.get("/<path:path>")
    def serve_frontend(path="index.html"):
        asset_path = FRONTEND_DIST / path
        if path != "index.html" and asset_path.exists() and asset_path.is_file():
            return send_from_directory(FRONTEND_DIST, path)

        index_file = FRONTEND_DIST / "index.html"
        if index_file.exists():
            return send_from_directory(FRONTEND_DIST, "index.html")
        return jsonify({"error": "Frontend build not found"}), 404

    return app


def checkOnReceive(files):
    if not files:
        return False, "No files uploaded"

    first_type = getattr(files[0], "content_type", "") or ""
    if "/" not in first_type:
        return False, "Unable to determine file type"

    general_type = first_type.split("/", 1)[0]
    for file in files:
        content_type = getattr(file, "content_type", "") or ""
        if "/" not in content_type:
            return False, f"Unable to determine file type for {getattr(file, 'filename', 'unknown')}"
        if content_type.split("/", 1)[0] != general_type:
            return False, f"File type mismatch: {content_type} and {general_type}."

    return True, general_type


app = create_app()


if __name__ == "__main__":
    app.run(
        host=os.getenv("CHATBRAIN_HOST", "127.0.0.1"),
        port=int(os.getenv("CHATBRAIN_PORT", "5000")),
        debug=os.getenv("CHATBRAIN_DEBUG", "false").lower() == "true",
    )
