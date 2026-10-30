from app.core import clean, find_relevant_passages, split_chunks


def test_clean_collapses_spaces_tabs_and_newlines():
    assert clean("  Bonjour\n\tle   monde  ") == "Bonjour le monde"


def test_split_chunks_preserves_text_content():
    chunks = split_chunks("Premier paragraphe. Deuxième paragraphe.", max_chars=24, overlap=4)
    assert chunks
    assert "Premier" in " ".join(chunks)
    assert "Deuxième" in " ".join(chunks)


def test_search_returns_matching_source_and_page():
    docs = [
        {"filename": "guide_math.pdf", "page": 12, "text": "Calculer le périmètre du rectangle avec longueur et largeur."},
        {"filename": "guide_svt.pdf", "page": 4, "text": "La cellule est l'unité de base du vivant."},
    ]
    results = find_relevant_passages("Calculer le périmètre du rectangle", docs, "Mathématiques")
    assert results
    assert results[0]["filename"] == "guide_math.pdf"
    assert results[0]["page"] == 12


def test_search_ignores_empty_pages():
    docs = [{"filename": "scan.pdf", "page": 1, "text": ""}]
    assert find_relevant_passages("question", docs) == []
