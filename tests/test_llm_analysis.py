from backend.llm import llm_analysis


def _reset_llm_caches():
    llm_analysis._client.cache_clear()
    llm_analysis._client_config.cache_clear()


def test_resolve_client_config_prefers_openai_defaults(monkeypatch):
    monkeypatch.delenv("CHATBRAIN_LLM_API_KEY", raising=False)
    monkeypatch.delenv("CHATBRAIN_LLM_BASE_URL", raising=False)
    monkeypatch.delenv("CHATBRAIN_LLM_MODEL", raising=False)
    monkeypatch.delenv("DEEPSEEK_API_KEY", raising=False)
    monkeypatch.setenv("OPENAI_API_KEY", "openai-test-key")
    _reset_llm_caches()

    config = llm_analysis._resolve_client_config()

    assert config == {
        "api_key": "openai-test-key",
        "base_url": None,
        "model": llm_analysis.DEFAULT_OPENAI_MODEL,
    }


def test_resolve_client_config_prefers_deepseek_when_available(monkeypatch):
    monkeypatch.delenv("CHATBRAIN_LLM_API_KEY", raising=False)
    monkeypatch.delenv("CHATBRAIN_LLM_BASE_URL", raising=False)
    monkeypatch.delenv("CHATBRAIN_LLM_MODEL", raising=False)
    monkeypatch.delenv("OPENAI_API_KEY", raising=False)
    monkeypatch.setenv("DEEPSEEK_API_KEY", "deepseek-test-key")
    _reset_llm_caches()

    config = llm_analysis._resolve_client_config()

    assert config == {
        "api_key": "deepseek-test-key",
        "base_url": "https://api.deepseek.com",
        "model": llm_analysis.DEFAULT_DEEPSEEK_MODEL,
    }


def test_resolve_client_config_prefers_explicit_chatbrain_settings(monkeypatch):
    monkeypatch.setenv("CHATBRAIN_LLM_API_KEY", "custom-test-key")
    monkeypatch.setenv("CHATBRAIN_LLM_BASE_URL", "https://example.com/v1")
    monkeypatch.setenv("CHATBRAIN_LLM_MODEL", "custom-model")
    monkeypatch.setenv("DEEPSEEK_API_KEY", "deepseek-test-key")
    monkeypatch.setenv("OPENAI_API_KEY", "openai-test-key")
    _reset_llm_caches()

    config = llm_analysis._resolve_client_config()

    assert config == {
        "api_key": "custom-test-key",
        "base_url": "https://example.com/v1",
        "model": "custom-model",
    }
