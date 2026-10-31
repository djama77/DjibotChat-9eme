from app.core import draft_grounded_answer


def test_no_passage_never_claims_official_correction():
    answer = draft_grounded_answer("Résoudre cet exercice", [])
    assert "corrigé introuvable" in answer.lower()
    assert "corrigé officiel" not in answer.lower() or "introuvable" in answer.lower()


def test_retrieved_course_passage_is_not_called_official_correction():
    passages = [{
        "filename": "guide_math.pdf",
        "page": 12,
        "text": "La formule de l'aire du rectangle est longueur multipliée par largeur.",
        "score": 0.4,
    }]
    answer = draft_grounded_answer("Calculer l'aire", passages)
    assert "correspondance à vérifier" in answer.lower()
    assert "n’est pas automatiquement le corrigé exact" in answer.lower()
    assert "[guide_math.pdf, page" not in answer
