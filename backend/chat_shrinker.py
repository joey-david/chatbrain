import re
import tkinter as tk
from tkinter import filedialog, simpledialog
from datetime import datetime, timedelta

def search_start(messages, start_datetime):
    for i in range(len(messages) - 1, -1, -1):
        message_datetime = extract_datetime(messages[i])
        if message_datetime and message_datetime < start_datetime:
            print(message_datetime)
            print(f"found start at {i}")
            return i + 1
    return 0

def extract_datetime(line):
    pattern = r'^(\d{1,2}/\d{1,2}/\d{2,4}),?\s*(\d{1,2}:\d{1,2}(?:\s?(?:AM|PM))?)?\s*-\s*(.*?):\s*(.*)$'
    match = re.match(pattern, line)
    if not match:
        return None
    date_str, hour_str, _, _ = match.groups()
    try:
        message_datetime = datetime.strptime(date_str, "%m/%d/%Y")
    except ValueError:
        message_datetime = datetime.strptime(date_str, "%m/%d/%y")
    if hour_str:
        try:
            message_time = datetime.strptime(hour_str, "%I:%M %p").time()
        except ValueError:
            message_time = datetime.strptime(hour_str, "%I:%M").time()
        message_datetime = datetime.combine(message_datetime, message_time)
    return message_datetime

def parse_datetime(date_str, time_str):
    if date_str:
        try:
            dt = datetime.strptime(date_str, "%m/%d/%Y")
        except ValueError:
            dt = datetime.strptime(date_str, "%m/%d/%y")
        if time_str:
            try:
                dt = datetime.combine(dt, datetime.strptime(time_str, "%I:%M %p").time())
            except ValueError:
                dt = datetime.combine(dt, datetime.strptime(time_str, "%I:%M").time())
        return dt
    return None

def create_nickname(name, used):
    i = 1
    while i <= len(name):
        candidate = name[:i]
        if candidate not in used:
            return candidate
        i += 1
    idx = 2
    candidate = name
    while candidate in used:
        candidate = f"{name}{idx}"
        idx += 1
    return candidate


def detect_platform(file):
    """
    Detects the platform of a chat log file.
    """
    if isinstance(file, str):
        messages = file.splitlines()
    else:
        messages = file.read().decode('utf-8').splitlines()
    if any(re.match(r'^(\d{1,2}/\d{1,2}/\d{2,4}),?\s*(\d{1,2}:\d{1,2}(?:\s?(?:AM|PM))?)?\s*-\s*(.*?):\s*(.*)$', line) for line in messages):
        return "whatsapp"
    if any(re.match(r'\S+\s—\s\S+\sat\s\d{1,2}:\d{1,2}\s(AM|PM)', line) for line in messages) or \
        any(re.match(r'\S+\s—\s\d{1,2}/\d{1,2}/\d{1,2},\s\d{1,2}:\d{1,2}\s(AM|PM)', line) for line in messages):
        return "discord"
    return "wrong"

def shrink_discord_chat(file, start_date=None, end_date=None, start_time=None, end_time=None, output_file=None):
    """
    Compacts a discord log file by removing messages outside a specified date
    and time range. Also compresses names to nicknames, and filters metadata
    messages. Each line after a 'header line' belongs to the same user/date/time
    until the next 'header line'. Detects all user names from the chat and assigns
    unique nicknames automatically.
    """
    last_datetime = None
    result = []
    name_to_nickname = {}
    used_nicknames = set()

    start_datetime = parse_datetime(start_date, start_time)
    end_datetime = parse_datetime(end_date, end_time)

    if isinstance(file, str):
        messages = file.splitlines()
    else:
        messages = file.read().decode('utf-8').splitlines()

    print(f"lines: {len(messages)}")

    # Regex to detect header lines. Make sure to exclude 'pin' messages.
    header_pattern = re.compile(r'^(?!.*pin)(.+?)\s+—\s+(Today|Yesterday|\d{1,2}/\d{1,2}/\d{2,4}),?\s*(\d{1,2}:\d{1,2}\s?(?:AM|PM))?$|^(?!.*pin)\S+\s—\s\d{1,2}/\d{1,2}/\d{1,2},\s\d{1,2}:\d{1,2}\s(AM|PM)$')

    lastIsNickname = False
    current_user = None
    current_datetime = None
    msgCount = 0

    for line in messages:
        line_stripped = line.strip()
        match = header_pattern.match(line_stripped)
        msgCount += 1
        if msgCount > 1000:
            raise Exception("Timeframe too wide, too many messages")
        if match:
            # We have a new user/date/time header
            if match.groups().__len__() == 4:
                user_raw, date_str, hour_str = match.groups()[0], match.groups()[1], match.groups()[2]
                current_datetime = parse_datetime(date_str, hour_str)
                # # Break if beyond end date/time
                # if end_datetime and current_datetime and current_datetime > end_datetime:
                #     break
                # Assign or reuse nickname
            if user_raw not in name_to_nickname:
                nickname = create_nickname(user_raw, used_nicknames)
                name_to_nickname[user_raw] = nickname
                used_nicknames.add(nickname)
                current_user = nickname
            else:
                nickname = name_to_nickname[user_raw]
                current_user = nickname
                # Show date/time if more than 1 hour from last or first time
            if last_datetime is None or (current_datetime - last_datetime) > timedelta(hours=1):
                date_out = date_str
                hour_out = hour_str
                last_datetime = current_datetime
            else:
                date_out = ""
                hour_out = ""
                # Just a header line, no actual message content
            line_out = ((date_out + " " + hour_out).strip() + " - " if (date_out or hour_out) else "") + f"{current_user}: "
            result.append(line_out)
            lastIsNickname = True

        else:
            # # Continuation of the current user's message
            # Append this line to the result
            if lastIsNickname:
                line_out = f"{line_stripped}"
            else:
                line_out = f"{current_user}: {line_stripped}"
            # No current user/time yet, just store raw
            if lastIsNickname:
                result[-1] += line_out
                lastIsNickname = False
            else:
                result.append(line_out)

    result_str = "\n".join(result)
    if output_file is not None:
        with open(output_file, "w", encoding="utf-8") as fout:
            fout.write(result_str)

    n_users = len(name_to_nickname)
    names = list(name_to_nickname.keys())
    usernames = list(name_to_nickname.values())
    return result_str, msgCount, n_users, names, usernames



def shrink_whatsapp_chat(file, start_date=None, end_date=None, start_time=None, end_time=None, output_file=None):
    """
    Compacts a whatsapp log file by removing messages outside a specified date and time range.
    Also compresses names to nicknames, and filters metadatamessages.
    Detects all user names from the chat and assigns unique nicknames automatically.
    """

    last_datetime = None
    result = []
    name_to_nickname = {}
    used_nicknames = set()

    start_datetime = parse_datetime(start_date, start_time)
    end_datetime = parse_datetime(end_date, end_time)

    if isinstance(file, str):
        messages = file.splitlines()
    else:
        messages = file.read().decode('utf-8').splitlines()

    start_index = search_start(messages, start_datetime) if start_datetime else 0
    msgCount = 0

    for line in messages[start_index:]:
        line = line.strip()
        message_datetime = extract_datetime(line)
        if not message_datetime:
            result.append(" " + line.replace("<This message was edited>", ""))
            continue
        if end_datetime and message_datetime > end_datetime:
            break

        msgCount += 1
        if msgCount > 1000:
            raise Exception("Timeframe too wide, too many messages")
        
        pattern = r'^(\d{1,2}/\d{1,2}/\d{2,4}),?\s*(\d{1,2}:\d{1,2}(?:\s?(?:AM|PM))?)?\s*-\s*(.*?):\s*(.*)$'
        match = re.match(pattern, line)
        if not match:
            result.append(line)
            continue

        date_str, hour_str, user, message = match.groups()
        message = message.replace("<This message was edited>", "")

        if user not in name_to_nickname:
            nickname = create_nickname(user, used_nicknames)
            name_to_nickname[user] = nickname
            used_nicknames.add(nickname)
        else:
            nickname = name_to_nickname[user]

        if last_datetime is None or (message_datetime - last_datetime) > timedelta(hours=1):
            date_out = date_str
            hour_out = hour_str
            last_datetime = message_datetime
        else:
            date_out = ""
            hour_out = ""

        line_out = ((date_out + " " + hour_out).strip() + " - " if (date_out or hour_out) else "") + f"{nickname}: {message}"
        result.append(line_out)

    result_str = "\n".join(result)
    if output_file is not None:
        with open(output_file, "w", encoding="utf-8") as fout:
            fout.write(result_str)

    n_users = len(name_to_nickname)
    names = list(name_to_nickname.keys())
    usernames = list(name_to_nickname.values())
    return result_str, msgCount, n_users, names, usernames

if __name__ == "__main__":
    def get_user_input(prompt):
        root = tk.Tk()
        root.withdraw()
        return simpledialog.askstring("Input", prompt)

    start_date = "12/28/2024"
    end_date = "12/29/2024"
    start_time = "12:00 AM"
    end_time = "11:59 PM"
    # get a file from a path
    file_path = "./data/martin_discord.txt"
    with open(file_path, "r") as f:
        file = f.read()
    print(f"detect_platform: {detect_platform(file)}")
    file, msgCount, n_users, user_list, nickname_list = shrink_discord_chat(
        file, start_date, end_date, start_time, end_time)
    with open("./data/martin_shrinked.txt", "w") as f:
        f.write(file)
    print(f"Messages: {msgCount}")
    print(f"Number of users: {n_users}")
    print(f"Users: {user_list}")
    print(f"Nicknames: {nickname_list}")