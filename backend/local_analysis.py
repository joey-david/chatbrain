import json
import re
import logging
from tqdm import tqdm
from typing import List, Dict, Any

def metadata_analysis(compressed_string: str, usernames: List[str], nicknames: List[str]) -> Dict[str, Any]:
    messages = compressed_string.split("\n")
    # Prepare stats dict
    stats = {nickname: {"messages": 0, "characters": 0} for nickname in nicknames}
    
    current_user = None

    # Compile regex patterns for efficiency
    pattern1 = re.compile(r"\d{1,2}/\d{1,2}/\d{2,4} \d{1,2}:\d{2} [APM]{2} - ")
    pattern2 = re.compile(r"\d{1,2}/\d{1,2}/\d{4} \d{1,2}:\d{2} - ")
    pattern3 = re.compile(r"\d{1,2}/\d{1,2}/\d{2,4}, \d{1,2}:\d{2} [APM]{2} - ")
    pattern4 = re.compile(r"\d{1,2}/\d{1,2}/\d{4}, \d{1,2}:\d{2} - ")
    
    for msg in tqdm(messages, desc="Analyzing messages"):
        msg = msg.strip()
        if not msg:
            continue  # Skip empty lines
        
        try:
            # Check if line starts with timestamp
            if pattern1.match(msg) or pattern2.match(msg) or pattern3.match(msg) or pattern4.match(msg):
                # New message with timestamp
                _, rest = msg.split(" - ", 1)
                if ": " in rest:
                    user, message = rest.split(": ", 1)
                    current_user = user.strip()
                else:
                    logging.warning(f"Skipping message without user: {msg}")
                    current_user = None
                    continue
            elif re.match(r"^\w+: ", msg):  # Line starts with 'nickname: '
                # New message without timestamp
                user, message = msg.split(": ", 1)
                current_user = user.strip()
            else:
                # Continuation of the previous user's message
                if current_user:
                    message = msg
                else:
                    logging.warning(f"Skipping message without a starting user: {msg}")
                    continue

            if current_user in stats and message:
                stats[current_user]["messages"] += 1
                stats[current_user]["characters"] += len(message)
            else:
                logging.warning(f"Unknown user '{current_user}' in message: {msg}")
        except ValueError:
            logging.warning(f"Skipping invalid message: {msg}")
            continue

    # Calculate final metrics
    total_messages = sum(user["messages"] for user in stats.values())
    total_characters = sum(user["characters"] for user in stats.values())

    results = {
        "total_messages": total_messages,
        "total_characters": total_characters
    }
    
    for nickname in nicknames:
        data = stats[nickname]
        msg_count = data["messages"]
        char_count = data["characters"]

        # Get the corresponding username for the nickname
        username = usernames[nicknames.index(nickname)]

        results[username] = {
            "messages": msg_count,
            "percentage_messages": round((msg_count / total_messages) * 100, 2) if total_messages else 0,
            "percentage_characters": round((char_count / total_characters) * 100, 2) if total_characters else 0,
            "average_message_length": round(char_count / msg_count, 2) if msg_count else 0
        }

    if results == {"total_messages": 0, "total_characters": 0}:
        logging.warning("No valid metadata found in the chat file.")

    return results

if __name__ == "__main__":
    # Configure logging
    logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')

    # Example usage
    with open("./data/martin_shrinked.txt", "r", encoding="utf-8") as fin:
        compressed_string = fin.read()
    
    logging.info("📊 Starting metadata analysis...")
    metadata = metadata_analysis(
        compressed_string=compressed_string,
        n_users=2,
        usernames=["T", "M"],
        nicknames=["Tortoised", "Martin"]
    )
    print("\nMetadata Analysis Results:")
    print(json.dumps(metadata, indent=2))