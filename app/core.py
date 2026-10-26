import re
from collections import Counter
from io import BytesIO
from typing import Any

import fitz
from PIL import Image


def clean(text: str) -> str:
    return re.sub(r"\s+", " ", text or "").strip()


def extract_pdf_pages(file_bytes: bytes, filename: str) -> list[dict[str, Any]]:
    """Extract PDF text page by page while retaining source and page number."""
    result = []
    with fitz.open(stream=file_bytes, filetype="pdf") as doc:
        for page_number, page in enumerate(doc, start=1):
            text = clean(page.get_text("text"))
            if text:
                for chunk in split_chunks(text):
                    result.append({"filename": filename, "page": page_number, "text": chunk})
            else:
                result.append({"filename": filename, "page": page_number, "text": ""})
    return result


def split_chunks(text: str, max_chars: int = 1000, overlap: int = 160) -> list[str]:
    text = clean(text)
    if not text:
        return []
    chunks = []
    start = 0
    while start < len(text):
        end = min(len(text), start + max_chars)
        if end < len(text):
            boundary = max(
                text.rfind(". ", start, end),
                text.rfind("; ", start, end),
                text.rfind(" ", start, end),
            )
            if boundary > start + max_chars // 2:
                end = boundary + 1
        chunk = text[start:end].strip()
        if chunk:
            chunks.append(chunk)
        if end >= len(text):
            break
        start = max(start + 1, end - overlap)
    return chunks


def ocr_image(image: Image.Image, languages: str = "fra+eng") -> str:
    """Read text from an exercise photo; requires Tesseract on the host computer."""
    import pytesseract
    return clean(pytesseract.image_to_string(image, lang=languages))


def tokens(text: str) -> list[str]:
    stop = set(
        "le la les un une des du de d et ou a au aux en dans pour par sur avec est sont "
        "qui que quoi comment pourquoi exercice question calculer déterminer montrer donner "
        "soit si alors ce cette ces son sa ses leur leurs on nous vous ils elles il elle être "
        "avoir faire plus moins comme mais donc où quel quelle quels quelles the an and or is "
        "of in to with what how why".split()
    )
    return [
        token for token in re.findall(r"[a-zA-ZÀ-ÿ0-9]+", text.lower())
        if len(token) > 1 and token not in stop
    ]


def find_relevant_passages(
    question: str,
    docs: list[dict],
    subject: str = "Toutes les matières",
    top_k: int = 5,
) -> list[dict]:
    query_tokens = tokens(question)
    if not query_tokens:
        return []
    query_set = set(query_tokens)
    candidates = []
    for document in docs:
        text = document.get("text", "")
        if not text:
            continue
        document_tokens = tokens(text)
        if not document_tokens:
            continue
        counts = Counter(document_tokens)
        overlap = len(query_set.intersection(counts)) / max(1, len(query_set))
        rarity = sum(1 / (1 + counts[token]) for token in query_set.intersection(counts))
        score = overlap + 0.08 * rarity
        if subject != "Toutes les matières" and set(tokens(subject)).intersection(document_tokens):
            score += 0.12
        if score >= 0.08:
            candidates.append({**document, "score": score})
    candidates.sort(key=lambda item: item["score"], reverse=True)
    results, seen = [], set()
    for item in candidates:
        key = (item["filename"], item["page"], item["text"][:120])
        if key in seen:
            continue
        results.append(item)
        seen.add(key)
        if len(results) >= top_k:
            break
    return results


def ask_ollama(
    question: str,
    passages: list[dict],
    model: str = "qwen2.5:3b",
    base_url: str = "http://localhost:11434",
) -> str:
    """Generate a French answer grounded in retrieved guide excerpts using local Ollama."""
    context = "\n\n".join(
        f"[Source : {passage['filename']}, page PDF {passage['page']}]\n{passage['text']}"
        for passage in passages
    )
    prompt = f"""Tu es un assistant pédagogique pour les élèves de 9e année à Djibouti.
Réponds en français, avec une explication claire, progressive et adaptée au niveau collège.
Utilise d'abord les extraits fournis. Ne prétends jamais qu'une réponse est officielle si les extraits ne le prouvent pas.
Si les sources ne suffisent pas, indique clairement ce qui manque et distingue les déductions de ce qui est écrit.
Pour les calculs, montre les étapes et vérifie le résultat. Termine par « Sources consultées » avec les fichiers et pages pertinents.

QUESTION / ÉNONCÉ :
{question}

EXTRAITS DES GUIDES DU PROFESSEUR :
{context if context else '[Aucun extrait pertinent trouvé dans les guides importés.]'}
"""
    import requests
    response = requests.post(
        f"{base_url.rstrip('/')}/api/chat",
        json={"model": model, "messages": [{"role": "user", "content": prompt}], "stream": False},
        timeout=180,
    )
    response.raise_for_status()
    data = response.json()
    return data.get("message", {}).get("content", "Réponse vide du modèle local.").strip()


def draft_grounded_answer(question: str, passages: list[dict]) -> str:
    if not passages:
        return (
            "Aucun extrait pertinent n’a été retrouvé dans les guides indexés. "
            "Cela ne signifie pas que l’exercice n’a pas de solution : vérifiez le texte saisi, "
            "la matière et les PDF importés."
        )
    best = passages[0]
    return (
        "**Énoncé recherché**\n\n" + question + "\n\n"
        "**Extrait le mieux classé dans les guides fournis**\n\n" + best["text"] + "\n\n"
        "**Source :** " + best["filename"] + ", page PDF " + str(best["page"]) + ".\n\n"
        "*Cet extrait est un résultat de recherche automatique, pas nécessairement le corrigé exact de l’exercice.*"
    )
