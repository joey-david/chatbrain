from api import utilities


def test_find_contact_name_prefers_highest_confidence_contact_box():
    img_results = [
        {
            "boxes": [
                {"cls": 2, "conf": 0.4, "text": "Math!ias", "xywhn": [0, 0, 0, 0], "side": "left"},
                {"cls": 2, "conf": 0.8, "text": "Matthias", "xywhn": [0, 0, 0, 0], "side": "left"},
            ],
            "oneSided": False,
            "conversationSide": "mixed",
        }
    ]

    assert utilities.findContactName(img_results) == "Matthias"


def test_add_names_uses_side_for_mixed_conversations():
    img_results = [
        {
            "boxes": [
                {"cls": 0, "conf": 0.2, "text": "hello", "xywhn": [0.25, 0.2, 0.2, 0.1], "side": "left"},
                {"cls": 1, "conf": 0.2, "text": "hi", "xywhn": [0.75, 0.5, 0.2, 0.1], "side": "right"},
            ],
            "oneSided": False,
            "conversationSide": "mixed",
        }
    ]

    processed = utilities.addNames(img_results, "Matthias")
    texts = [box["text"] for box in processed[0]["boxes"]]

    assert texts == ["Matthias: hello", "You: hi"]


def test_add_names_handles_left_only_conversations():
    img_results = [
        {
            "boxes": [
                {"cls": 0, "conf": 0.15, "text": "left only 1", "xywhn": [0.2, 0.2, 0.2, 0.1], "side": "left"},
                {"cls": 0, "conf": 0.15, "text": "left only 2", "xywhn": [0.22, 0.4, 0.2, 0.1], "side": "left"},
            ],
            "oneSided": True,
            "conversationSide": "left",
        }
    ]

    processed = utilities.addNames(img_results, "Matthias")
    assert all(box["assignedUser"] == "Matthias" for box in processed[0]["boxes"])


def test_add_names_handles_right_only_conversations():
    img_results = [
        {
            "boxes": [
                {"cls": 1, "conf": 0.15, "text": "right only", "xywhn": [0.8, 0.2, 0.2, 0.1], "side": "right"},
            ],
            "oneSided": True,
            "conversationSide": "right",
        }
    ]

    processed = utilities.addNames(img_results, "Matthias")
    assert processed[0]["boxes"][0]["text"] == "You: right only"


def test_compile_analysis_aggregates_generic_conversation():
    attributed_results = [
        {
            "boxes": [
                {"cls": 0, "text": "Matthias: hello"},
                {"cls": 1, "text": "You: hi"},
            ],
            "oneSided": False,
            "conversationSide": "mixed",
        },
        {
            "boxes": [
                {"cls": 1, "text": "You: follow up"},
            ],
            "oneSided": True,
            "conversationSide": "right",
        },
    ]

    metadata, conversation = utilities.compileAnalysis(attributed_results)

    assert metadata["total_messages"] == 3
    assert metadata["You"]["number_messages"] == 2
    assert "Matthias: hello" in conversation


def test_compile_analysis_filters_ui_noise():
    attributed_results = [
        {
            "boxes": [
                {"cls": 0, "text": "You: AirDrop"},
                {"cls": 0, "text": "Other: Copy"},
                {"cls": 0, "text": "Other: Wallpaper"},
            ],
            "oneSided": False,
            "conversationSide": "mixed",
        }
    ]

    metadata, conversation = utilities.compileAnalysis(attributed_results)

    assert metadata["total_messages"] == 0
    assert conversation == ""
