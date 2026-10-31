from app import core


class FakeResponse:
    ok = True

    def json(self):
        return {
            "model": "deepseek-flash",
            "choices": [{"message": {"content": "Voici une explication fondée sur le guide."}}],
        }


def test_deepseek_uses_official_endpoint_and_key(monkeypatch):
    captured = {}

    def fake_post(url, **kwargs):
        captured["url"] = url
        captured.update(kwargs)
        return FakeResponse()

    monkeypatch.setattr(core.requests, "post", fake_post)
    monkeypatch.setenv("DEEPSEEK_MODEL", "deepseek-flash")

    result = core.ask_deepseek(
        "Calculer le périmètre du rectangle",
        [{"filename": "guide_math.pdf", "page": 12, "text": "P = 2 × (L + l)", "score": 0.8}],
        "test-secret",
    )

    assert captured["url"] == "https://api.deepseek.com/chat/completions"
    assert captured["headers"]["Authorization"] == "Bearer test-secret"
    assert captured["json"]["model"] == "deepseek-flash"
    assert "guide_math.pdf" in captured["json"]["messages"][1]["content"]
    assert "Voici une explication" in result
    assert "Modèle utilisé : deepseek-flash" in result


def test_deepseek_requires_api_key():
    try:
        core.ask_deepseek("Question de test", [], " ")
    except ValueError as exc:
        assert "DEEPSEEK_API_KEY" in str(exc)
    else:
        raise AssertionError("Une clé API vide doit être refusée.")
