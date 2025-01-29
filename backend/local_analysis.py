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
    pattern = re.compile(r"^(\w+) (— )?(\w+) (\w+) (\d{1,2}:\d{2})(.*)")
    
    match = pattern.match(line)
    if match:
        username, message = match.group(1), match.group(6).strip()
        return username, message
    return None, line

    
def parse_whatsapp_line(line: str, mute: bool = False):
    """
    Extracts user and message from a WhatsApp-formatted line.
    """
    line = line.replace(" AM", "").replace(" PM", "")
    pattern = re.compile(r"^\[(\d{1,2}\/\d{1,2}\/\d{2}),? (\d{1,2}:\d{2}:\d{2})\] ([\w ]*):(.*)")

    match = pattern.match(line)
    if match:
        user, message = match.group(3), match.group(4).strip()
        return user, message
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

def update_stats(stats: Dict[str, Dict[str, int]], user: str, message: str):
    if user not in stats:
        stats[user] = {"messages": 1, "characters": len(message)}
    else:
        stats[user]["messages"] += 1
        stats[user]["characters"] += len(message)


def metadata_analysis(
    string: str,
    inputType: str, # "text", "image", or "audio"
    detectedPlatform: str # "discord", "whatsapp", "generic", etc.
):
    """Return metadata analysis for a string of messages."""
    messages = string.split("\n")
    stats = {}
    current_user = "unidentifiable"
    buffer = ""

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
        elif detectedPlatform == "unknown":
            user, message = "unidentifiable", line
        if user and message:
            update_stats(stats, current_user, buffer)
            print(f"currUser: {current_user}, buffer: {buffer}")
            current_user = user
            buffer = message
        
        elif user:
            update_stats(stats, current_user, buffer)
            print(f"currUser: {current_user}, buffer: {buffer}")
            current_user = user
            buffer = ""
        
        elif message:
            if buffer != "":
                buffer += "\n"
            buffer += message

        else:
            warnings.warn(f"Unrecognized Discord line format: {line}")
    
    update_stats(stats, current_user, buffer)

    # Calculate final tallies...
    total_messages = sum(u["messages"] for u in stats.values())
    total_characters = sum(u["characters"] for u in stats.values())
    userList = list(stats.keys())
    # Map stats back to real usernames
    return userList, stats, total_messages, total_characters

if __name__ == "__main__":

    user, name = parse_discord_line("Tortoised — Today at 2:55 PM")
    print(f"User: {user}, message: {name}")
    with open("data/sucide_discord.txt", "r") as f:
        string = f.read()
    userList, stats, total_messages, total_characters = metadata_analysis(string, "text", "discord")
    print(f"User list: {userList}")
    print(f"Stats: {stats}")
    print(f"Total messages: {total_messages}")
    print(f"Total characters: {total_characters}")
