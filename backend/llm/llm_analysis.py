from __future__ import annotations

import json
import os
import re
from functools import lru_cache
from typing import Dict, List, TypedDict

from dotenv import load_dotenv
from openai import OpenAI


load_dotenv()

DEFAULT_MAX_INPUT_CHARS = int(os.getenv("CHATBRAIN_LLM_MAX_INPUT_CHARS", "12000"))
DEFAULT_OPENAI_MODEL = os.getenv("CHATBRAIN_OPENAI_MODEL", "gpt-4o-mini")
DEFAULT_DEEPSEEK_MODEL = os.getenv("CHATBRAIN_DEEPSEEK_MODEL", "deepseek-chat")


def _clip_conversation(conversation: str, max_chars: int = DEFAULT_MAX_INPUT_CHARS) -> str:
    if len(conversation) <= max_chars:
        return conversation

    lines = [line for line in conversation.splitlines() if line.strip()]
    if len(lines) <= 6:
        return conversation[:max_chars]

    keep_head = max(2, len(lines) // 3)
    keep_tail = max(2, len(lines) // 3)
    middle = lines[keep_head:-keep_tail]

    budget = max_chars - sum(len(line) + 1 for line in (lines[:keep_head] + lines[-keep_tail:])) - 32
    sampled_middle = []
    if budget > 0 and middle:
        step = max(1, len(middle) // 8)
        for line in middle[::step]:
            if budget <= len(line):
                break
            sampled_middle.append(line)
            budget -= len(line) + 1

    clipped = lines[:keep_head] + ["[...conversation truncated for budget...]"] + sampled_middle + lines[-keep_tail:]
    return "\n".join(clipped)[:max_chars]

def getSystemPrompt(users: List[str], metadata: Dict | None = None) -> str:
    participants = ", ".join(user for user in users if user and user != "unidentifiable") or "User1, User2"
    metadata_hint = json.dumps(metadata, ensure_ascii=False) if metadata else "null"

    return f"""
You analyze chat conversations and produce spectacular, high-signal character and relationship reads.

Rules:
- Distinguish speakers strictly by the provided labels: {participants}.
- Do not invent extra speakers, merge speakers, or rename them.
- You may make bold hypotheses and non-obvious social or psychological inferences, but they must still be traceable to the tone, wording, pacing, asymmetry, and interaction patterns in the messages.
- Keep the insights in the dominant language of the conversation.
- Return JSON only, with no markdown or commentary.
- The insights must not be summaries. They should feel incisive, specific, and memorable.

Use this exact schema:
{{
  "conversation_metrics": {{
    "stability_score_out_of_100": 0,
    "health_score_out_of_100": 0,
    "intensity_score_out_of_100": 0
  }},
  "users": {{
    "{participants.split(', ')[0]}": {{
      "assertiveness": 0,
      "positiveness": 0,
      "affection_towards_other": 0,
      "romantic_attraction_towards_other": 0,
      "rationality": 0,
      "emotiveness": 0,
      "IQ_estimate": 0
    }}
  }},
  "insights": ["", "", ""]
}}
Available metadata summary:
{metadata_hint}
""".strip()


def _extract_json(content: str):
    try:
        return json.loads(content)
    except json.JSONDecodeError:
        match = re.search(r"\{.*\}", content, re.DOTALL)
        if not match:
            raise
        return json.loads(match.group(0))

class ClientConfig(TypedDict):
    api_key: str
    model: str
    base_url: str | None


def _resolve_client_config() -> ClientConfig | None:
    if os.getenv("CHATBRAIN_ENABLE_LLM", "true").lower() == "false":
        return None

    explicit_api_key = os.getenv("CHATBRAIN_LLM_API_KEY")
    explicit_base_url = os.getenv("CHATBRAIN_LLM_BASE_URL")
    explicit_model = os.getenv("CHATBRAIN_LLM_MODEL")

    if explicit_api_key:
        return {
            "api_key": explicit_api_key,
            "base_url": explicit_base_url or None,
            "model": explicit_model or DEFAULT_OPENAI_MODEL,
        }

    deepseek_api_key = os.getenv("DEEPSEEK_API_KEY")
    if deepseek_api_key:
        return {
            "api_key": deepseek_api_key,
            "base_url": explicit_base_url or "https://api.deepseek.com",
            "model": explicit_model or DEFAULT_DEEPSEEK_MODEL,
        }

    openai_api_key = os.getenv("OPENAI_API_KEY")
    if openai_api_key:
        return {
            "api_key": openai_api_key,
            "base_url": explicit_base_url or None,
            "model": explicit_model or DEFAULT_OPENAI_MODEL,
        }

    return None


@lru_cache(maxsize=1)
def _client_config() -> ClientConfig | None:
    return _resolve_client_config()


@lru_cache(maxsize=1)
def _client() -> OpenAI | None:
    config = _client_config()
    if config is None:
        return None
    if config["base_url"]:
        return OpenAI(api_key=config["api_key"], base_url=config["base_url"])
    return OpenAI(api_key=config["api_key"])


def _create_json_completion(client: OpenAI, model: str, messages: List[Dict[str, str]], max_output_tokens: int):
    try:
        return client.chat.completions.create(
            model=model,
            messages=messages,
            max_tokens=max_output_tokens,
            response_format={"type": "json_object"},
            temperature=0.2,
        )
    except Exception as exc:
        unsupported_json_mode = any(
            token in str(exc).lower()
            for token in ("response_format", "json_object", "unsupported", "invalid parameter")
        )
        if not unsupported_json_mode:
            raise

        fallback_messages = messages + [
            {
                "role": "user",
                "content": "Return valid JSON only. Do not wrap it in markdown.",
            }
        ]
        return client.chat.completions.create(
            model=model,
            messages=fallback_messages,
            max_tokens=max_output_tokens,
            temperature=0.2,
        )


def promptToJSON(prompt: str, maxOutputTokens: int = 900, users: List[str] | None = None, metadata: Dict | None = None):
    users = [user for user in (users or []) if user]
    clipped_prompt = _clip_conversation(prompt)
    client = _client()
    config = _client_config()

    if client is None or config is None:
        raise RuntimeError("LLM analysis is unavailable because no API key is configured.")

    response = _create_json_completion(
        client=client,
        model=config["model"],
        messages=[
            {"role": "system", "content": getSystemPrompt(users, metadata)},
            {"role": "user", "content": clipped_prompt},
        ],
        max_output_tokens=maxOutputTokens,
    )

    content = response.choices[0].message.content or "{}"
    try:
        parsed = _extract_json(content)
    except json.JSONDecodeError:
        raise RuntimeError("The LLM response was not valid JSON.")

    parsed.setdefault("insights", [])
    parsed.setdefault("users", {})
    parsed.setdefault("conversation_metrics", {})
    return parsed
