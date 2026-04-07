from backend import local_analysis


def test_detects_whatsapp_export_formats():
    bracket = "[12/02/25, 14:03:00] Alice: Salut"
    dashed = "12/02/25, 14:03 - Alice: Salut"

    assert local_analysis.detect_platform(bracket) == "whatsapp"
    assert local_analysis.detect_platform(dashed) == "whatsapp"


def test_detects_generic_logs_with_spaces_in_names():
    text = "Alice Doe: hi there\nBob Smith: hey"
    assert local_analysis.detect_platform(text) == "generic"


def test_parses_multiline_generic_messages():
    conversation = "\n".join(
        [
            "Alice Doe: first line",
            "still Alice",
            "Bob: answer",
            "Alice Doe: final thought",
        ]
    )

    metadata, split_conv = local_analysis.metadata_analysis(conversation, "text", "generic")

    assert metadata["total_messages"] == 3
    assert metadata["Alice Doe"]["number_messages"] == 2
    assert metadata["Bob"]["number_messages"] == 1
    assert "Alice Doe: first line\nstill Alice" in split_conv


def test_parses_whatsapp_multiline_messages():
    conversation = "\n".join(
        [
            "12/02/25, 14:03 - Alice: Bonjour",
            "suite du message",
            "12/02/25, 14:05 - Bob: Salut",
        ]
    )

    metadata, split_conv = local_analysis.metadata_analysis(conversation, "text", "whatsapp")

    assert metadata["total_messages"] == 2
    assert metadata["Alice"]["number_messages"] == 1
    assert "Alice: Bonjour\nsuite du message" in split_conv


def test_parses_discord_headers_and_following_lines():
    conversation = "\n".join(
        [
            "Alice Doe — 12/02/25, 14:03",
            "hello from discord",
            "Bob — 12/02/25, 14:04",
            "reply",
        ]
    )

    metadata, split_conv = local_analysis.metadata_analysis(conversation, "text", "discord")

    assert metadata["total_messages"] == 2
    assert metadata["Alice Doe"]["number_messages"] == 1
    assert metadata["Bob"]["number_messages"] == 1
    assert split_conv.startswith("Alice Doe: hello from discord")
