from __future__ import annotations

import re
from typing import Dict, Iterable, Optional, Tuple


DISCORD_HEADER_RE = re.compile(
    r"""
    ^
    (?P<user>.+?)
    \s+—\s+
    (?:
        (?:Today|Aujourd'hui|Yesterday|Hier|Heute|Hoy|Oggi|昨日)
        |
        \d{1,2}[/-]\d{1,2}[/-]\d{2,4}
    )
    (?:
        ,\s*
        |
        \s+(?:at|à)\s+
    )
    (?P<time>\d{1,2}:\d{2}(?:\s?(?:AM|PM))?)
    (?P<message>.*)
    $
    """,
    re.VERBOSE,
)

WHATSAPP_BRACKET_RE = re.compile(
    r"""
    ^
    \[
    (?P<date>\d{1,2}/\d{1,2}/\d{2,4})
    ,?\s+
    (?P<time>\d{1,2}:\d{2}(?::\d{2})?(?:\s?(?:AM|PM))?)
    \]
    \s+
    (?P<user>[^:]+):
    \s*(?P<message>.*)
    $
    """,
    re.VERBOSE,
)

WHATSAPP_DASH_RE = re.compile(
    r"""
    ^
    (?P<date>\d{1,2}/\d{1,2}/\d{2,4})
    ,?\s+
    (?P<time>\d{1,2}:\d{2}(?::\d{2})?(?:\s?(?:AM|PM))?)
    \s+-\s+
    (?P<user>[^:]+):
    \s*(?P<message>.*)
    $
    """,
    re.VERBOSE,
)

GENERIC_RE = re.compile(r"^(?P<user>[^:]{1,80}?)\s*:\s*(?P<message>.+)$")

SYSTEM_PREFIXES = (
    "Messages and calls are end-to-end encrypted",
    "You created group",
    "Missed voice call",
    "Missed video call",
)


def _normalize_message_line(line: str) -> str:
    return line.replace("\ufeff", "").replace(" AM", " AM").replace(" PM", " PM").strip()


def _normalize_user(user: Optional[str]) -> Optional[str]:
    if not user:
        return None
    cleaned = " ".join(user.split()).strip(" \u200e\u200f")
    return cleaned or None


def _join_message(existing: str, addition: str) -> str:
    addition = addition.strip()
    if not addition:
        return existing
    if not existing:
        return addition
    return f"{existing}\n{addition}"


def parse_discord_line(line: str) -> Tuple[Optional[str], str]:
    match = DISCORD_HEADER_RE.match(line)
    if not match:
        return None, line
    return _normalize_user(match.group("user")), match.group("message").strip()


def parse_whatsapp_line(line: str) -> Tuple[Optional[str], str]:
    for pattern in (WHATSAPP_BRACKET_RE, WHATSAPP_DASH_RE):
        match = pattern.match(line)
        if match:
            return _normalize_user(match.group("user")), match.group("message").strip()
    return None, line


def parse_generic_line(line: str, current_user: Optional[str] = None) -> Tuple[Optional[str], str]:
    match = GENERIC_RE.match(line)
    if match:
        return _normalize_user(match.group("user")), match.group("message").strip()
    return current_user, line


def update_stats(stats: Dict[str, Dict[str, int]], user: str, message: str, split_conv: str) -> str:
    message = message.strip()
    if not message:
        return split_conv

    if user not in stats:
        stats[user] = {"messages": 1, "characters": len(message)}
    else:
        stats[user]["messages"] += 1
        stats[user]["characters"] += len(message)

    return split_conv + f"{user}: {message}\n"


def _should_skip_unknown_line(line: str) -> bool:
    if not line:
        return True
    return any(line.startswith(prefix) for prefix in SYSTEM_PREFIXES)


def _iter_lines(string: str) -> Iterable[str]:
    for raw_line in string.splitlines():
        line = _normalize_message_line(raw_line)
        if line:
            yield line


def metadata_analysis(string: str, inputType: str, detectedPlatform: str):
    del inputType

    stats: Dict[str, Dict[str, int]] = {}
    current_user = "unidentifiable"
    buffer = ""
    split_conv = ""

    for line in _iter_lines(string):
        if detectedPlatform == "discord":
            user, message = parse_discord_line(line)
        elif detectedPlatform == "whatsapp":
            user, message = parse_whatsapp_line(line)
        elif detectedPlatform == "generic":
            user, message = parse_generic_line(line, current_user)
        else:
            user, message = None, line

        user = _normalize_user(user)
        message = message.strip()

        if user and detectedPlatform != "generic":
            if buffer:
                split_conv = update_stats(stats, current_user, buffer, split_conv)
            current_user = user
            buffer = message
            continue

        if detectedPlatform == "generic" and user:
            if buffer and user != current_user:
                split_conv = update_stats(stats, current_user, buffer, split_conv)
                buffer = ""
            current_user = user
            buffer = _join_message(buffer, message)
            continue

        if current_user == "unidentifiable" and _should_skip_unknown_line(message):
            continue

        buffer = _join_message(buffer, message)

    if buffer and current_user != "unidentifiable":
        split_conv = update_stats(stats, current_user, buffer, split_conv)

    total_messages = sum(user_stats["messages"] for user_stats in stats.values())
    total_characters = sum(user_stats["characters"] for user_stats in stats.values())

    results = {
        "total_messages": total_messages,
        "total_characters": total_characters,
    }

    for user, user_stats in stats.items():
        results[user] = {
            "number_messages": user_stats["messages"],
            "number_characters": user_stats["characters"],
        }

    return results, split_conv


def detect_platform(string: str) -> str:
    for line in _iter_lines(string):
        if DISCORD_HEADER_RE.match(line):
            return "discord"
        if WHATSAPP_BRACKET_RE.match(line) or WHATSAPP_DASH_RE.match(line):
            return "whatsapp"

    for line in _iter_lines(string):
        if GENERIC_RE.match(line):
            return "generic"

    return "unknown"
