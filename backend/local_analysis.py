import re
from tqdm import tqdm
from typing import Dict, List, Any
import warnings

def parse_discord_line(line: str) -> tuple:
    """
    Returns (username, message) with message being everything after the timestamp.
    Handles all specified formats and empty messages.
    """
    line = line.replace(" AM", "").replace(" PM", "")
    pattern = re.compile(r"""^(\w+) (— )?(\w+)? (\w+)? (\d{1,2}:\d{2})(.*)|^(\w+) (— )?(\d{1,2}\/\d{1,2}\/\d{2}).? ?(\d{1,2}?.{1,2}\d{2})?(.*)""")
    
    match = pattern.match(line)
    if match:
        username = match.group(1) or match.group(7)
        message = (match.group(6) or match.group(11))
        return username, message
    return None, line

    
def parse_whatsapp_line(line: str, mute: bool = False):
    """
    Returns (username, message) with message being everything after the timestamp.
    Handles all specified formats and empty messages.
    """
    line = line.replace(" AM", "").replace(" PM", "")
    pattern = re.compile(r"^\[(\d{1,2}\/\d{1,2}\/\d{2}),? (\d{1,2}:\d{2}:\d{2})\] ([\w ]*):(.*)")

    match = pattern.match(line)
    if match:
        username, message = match.group(3), match.group(4).strip()
        return username, message
    return None, line


def parse_generic_line(line: str, current_user: str = None):
    """
    Extracts user and message from a generic line.
    """
    # First format: Marlin: Hello or Marlin : Hello
    match = re.match(r"^(\w+)\s*:\s*(.+)$", line)    
    if match:
        user, message = match.group(1), match.group(2)
        return user, message
    return current_user, line

def update_stats(stats: Dict[str, Dict[str, int]], user: str, message: str, splitConv: str):
    """Updates the metadata summary, and adds the user and message to the split conversation on a newline."""
    if user not in stats:
        stats[user] = {"messages": 1, "characters": len(message)}
    else:
        stats[user]["messages"] += 1
        stats[user]["characters"] += len(message)
    splitConv += f"{user}: {message}\n"
    return splitConv


def metadata_analysis(
    string: str,
    inputType: str,
    detectedPlatform: str
):
    messages = string.replace(" AM", "").replace(" PM", "").split("\n")
    stats = {}
    current_user = "unidentifiable"
    buffer = ""
    splitConv = ""

    for line in messages:
        line = line.strip()
        if not line:
            continue

        if detectedPlatform == "discord":
            user, message = parse_discord_line(line)
        elif detectedPlatform == "whatsapp":
            user, message = parse_whatsapp_line(line)
        elif detectedPlatform == "generic":
            user, message = parse_generic_line(line)
        else:
            user, message = "unidentifiable", line

        if user and message:
            if buffer != "":
                splitConv = update_stats(stats, current_user, buffer, splitConv)
            current_user = user
            buffer = message
        elif user:
            if buffer != "":
                splitConv = update_stats(stats, current_user, buffer, splitConv)
            current_user = user
            buffer = ""
        elif message:
            if buffer:
                buffer += "\n"
            buffer += message

    if not (buffer == "" and current_user == "unidentifiable"):
        splitConv = update_stats(stats, current_user, buffer, splitConv)
    total_messages = sum(u["messages"] for u in stats.values())
    total_characters = sum(u["characters"] for u in stats.values())

    results = {
        "total_messages": total_messages,
        "total_characters": total_characters
    }

    for user, data in stats.items():
        results[user] = {
            "number_messages": data["messages"],
            "number_characters": data["characters"],
        }

    return results, splitConv


def detect_platform(string: str):
    """
    Detects the platform of the chat from the first few lines.
    """
    lines = string.replace(" AM", "").replace(" PM", "").split("\n")
    for line in lines:
        if re.match(r"^(\w+) (— )?(\w+)? (\w+)? (\d{1,2}:\d{2})(.*)|^(\w+) (— )?(\d{1,2}\/\d{1,2}\/\d{2}).? ?(\d{1,2}?.{1,2}\d{2})?(.*)", line):
            return "discord"
        if re.match(r"^\[(\d{1,2}\/\d{1,2}\/\d{2}),? (\d{1,2}:\d{2}:\d{2})\] ([\w ]*):(.*)", line):
            return "whatsapp"
    for line in lines:
        if re.match(r"^\w+\s*:\s*.+", line):
            return "generic"
    return "unknown"


if __name__ == "__main__":

    with open("data/sucide_discord.txt", "r") as f:
        string = f.read().replace(" AM", "").replace(" PM", "")
    print(f"detect_platform: {detect_platform(string)}")
    metadata, conv = metadata_analysis(string, "text", detect_platform(string))
    print(f"conversation: {conv}")
    print(f"metadata: {metadata}")
