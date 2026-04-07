# ChatBrain

ChatBrain analyzes exported chat logs or screenshot batches, extracts speaker-separated conversations, computes local metadata, and then sends the cleaned conversation to an LLM for a more ambitious social read.

## Stack

- `chatbrain/`: Vite + React frontend
- `api/`: Flask API
- `backend/local_analysis.py`: text parsing and metadata aggregation
- `backend/vision/`: screenshot detection + OCR
- `backend/llm/llm_analysis.py`: prompt construction and JSON-only LLM analysis

## Backend setup

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
python api/api.py
```

Useful environment variables:

- `CHATBRAIN_HOST=127.0.0.1`
- `CHATBRAIN_PORT=5000`
- `CHATBRAIN_MODEL_PATH=backend/vision/best.pt`
- `CHATBRAIN_VISION_CONF=0.18`
- `CHATBRAIN_VISION_IMGSZ=960`
- `CHATBRAIN_OCR_LANGS=fr,en`
- `CHATBRAIN_LLM_API_KEY=...`
- `CHATBRAIN_LLM_BASE_URL=https://api.deepseek.com`
- `CHATBRAIN_LLM_MODEL=deepseek-chat`
- `OPENAI_API_KEY=...`
- `CHATBRAIN_OPENAI_MODEL=gpt-4o-mini`

LLM resolution order:

- Explicit `CHATBRAIN_LLM_*` settings
- `DEEPSEEK_API_KEY`
- `OPENAI_API_KEY`

If no usable LLM API key is configured, the metadata path still works but `/llm` will return an error instead of falling back to canned text.

## Frontend setup

```bash
cd chatbrain
npm install
VITE_API_BASE_URL=http://localhost:5000 npm run dev
```

For production:

```bash
cd chatbrain
VITE_API_BASE_URL=https://your-host.example npm run build
```

## Verification

Run parser and attribution tests:

```bash
pytest tests
```

Benchmark bundled screenshots:

```bash
python backend/benchmark_screenshots.py
```
