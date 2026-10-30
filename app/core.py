import base64
import re
from collections import Counter
from io import BytesIO
from typing import Any

import fitz
import requests
from PIL import Image


def clean(text: str) -> str:
    return re.sub(r"\\s+", " ", text or "").strip()


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
                # Keep empty pages visible: scanned pages may need OCR in a later version.
                result.append({"filename": filename, "page": page_number, "text": ""})
    return result


def split_chunks(text: str, max_chars: int = 1000, overlap: int = 160) -> list[str]:
    text = clean(text)
    if not text:
        return []
    chunks, start = [], 0
    while start < len(text):
        end = min(len(text), start + max_chars)
        if end < len(text):
            boundary = max(text.rfind(". ", start, end), text.rfind("; ", start, end), text.rfind(" ", start, end))
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
    return [token for token in re.findall(r"[a-zA-ZÀ-ÿ0-9]+", text.lower()) if len(token) > 1 and token not in stop]


def find_relevant_passages(question: str, docs: list[dict], subject: str = "Toutes les matières", top_k: int = 6) -> list[dict]:
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
        common = query_set.intersection(counts)
        overlap = len(common) / max(1, len(query_set))
        rarity = sum(1 / (1 + counts[token]) for token in common)
        score = overlap + 0.08 * rarity
        filename = document.get("filename", "").lower()
        subject_map = {
            "Mathématiques": ("math", "mathematique"),
            "SVT": ("svt", "science de la vie"),
            "Physique-Chimie": ("pc", "physique", "chimie"),
            "Français": ("fr", "francais", "français"),
            "Anglais": ("anglais", "english", "ang"),
            "Histoire-Géographie": ("histoire", "geo", "géographie", "geographie"),
            "Informatique": ("info", "informatique"),
        }
        if subject != "Toutes les matières":
            if any(word in filename for word in subject_map.get(subject, ())):
                score += 0.25
            elif set(tokens(subject)).intersection(document_tokens):
                score += 0.05
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


def _context(question: str, passages: list[dict]) -> str:
    if not passages:
        return "[Aucun extrait pertinent retrouvé dans les guides indexés.]"
    return "\n\n".join(
        f"[Source : {p['filename']}, page PDF {p['page']}, pertinence {p.get('score', 0):.2f}]\n{p['text']}"
        for p in passages
    )


def ask_openrouter(question: str, passages: list[dict], api_key: str) -> str:
    """Generate a French, guide-grounded answer using OpenRouter free-model router."""
    if not api_key.strip():
        raise ValueError("Clé API OpenRouter manquante. Ajoutez OPENROUTER_API_KEY dans les secrets ou variables d’environnement.")
    prompt = f"""Tu es un assistant pédagogique pour les élèves de 9e année à Djibouti.
Réponds en français, avec une explication simple, progressive et adaptée au collège.
PRIORITÉ ABSOLUE : les guides du professeur fournis ci-dessous sont la référence.
Ne présente jamais une réponse générée comme un corrigé officiel si les extraits ne contiennent pas la correction correspondante.
Si aucun extrait ne correspond assez clairement, écris exactement « CORRIGÉ OFFICIEL INTROUVABLE DANS LES GUIDES FOURNIS », puis propose éventuellement une piste de méthode clairement étiquetée « Explication générale (non vérifiée dans le guide) ».
Distingue toujours : 1) corrigé retrouvé dans le guide, 2) explication pédagogique reformulée, 3) éléments non vérifiés.
Pour les calculs, montre les étapes. N’invente jamais de nom de guide, de chapitre ou de page. Cite chaque source sous la forme [nom du fichier, page PDF N].
Question/exercice de l’élève :
{question}

EXTRAITS RETROUVÉS DANS LES GUIDES :
{_context(question, passages)}
"""
    response = requests.post(
        "https://openrouter.ai/api/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {api_key.strip()}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://djibotchat-9eme.vercel.app",
            "X-Title": "DjibotChat 9e année",
        },
        json={
            "model": "openrouter/free",
            "messages": [
                {"role": "system", "content": "Tu es un assistant scolaire rigoureux. N’invente jamais de sources ou de pages."},
                {"role": "user", "content": prompt},
            ],
            "temperature": 0.2,
            "stream": False,
        },
        timeout=120,
    )
    if not response.ok:
        raise RuntimeError(f"Erreur OpenRouter ({response.status_code}) : {response.text[:500]}")
    data = response.json()
    choices = data.get("choices", [])
    answer = choices[0].get("message", {}).get("content", "").strip() if choices else ""
    if not answer:
        raise RuntimeError("OpenRouter n’a renvoyé aucune réponse exploitable.")
    selected_model = data.get("model")
    if selected_model:
        answer += f"\n\nModèle utilisé : {selected_model}"
    return answer

def ask_ollama(question: str, passages: list[dict], model: str = "qwen2.5:3b", base_url: str = "http://localhost:11434") -> str:
    """Generate a French answer grounded in retrieved guide excerpts using local Ollama."""
    prompt = f"""Tu es un assistant pédagogique pour les élèves de 9e année à Djibouti.
Réponds en français avec des étapes simples. Utilise d'abord les extraits fournis.
N'affirme jamais qu'une réponse est officielle si les extraits ne le prouvent pas.
Si aucun extrait ne correspond clairement, indique « CORRIGÉ OFFICIEL INTROUVABLE DANS LES GUIDES FOURNIS ».
N'invente jamais de source ni de numéro de page. Termine par les fichiers et pages pertinents.

QUESTION :
{question}

EXTRAITS DES GUIDES :
{_context(question, passages)}
"""
    response = requests.post(f"{base_url.rstrip('/')}/api/chat", json={
        "model": model, "messages": [{"role": "user", "content": prompt}], "stream": False
    }, timeout=180)
    response.raise_for_status()
    return response.json().get("message", {}).get("content", "Réponse vide du modèle local.").strip()


def draft_grounded_answer(question: str, passages: list[dict]) -> str:
    if not passages:
        return (
            "**Statut : corrigé introuvable dans les extraits indexés.**\n\n"
            "Aucun passage suffisamment pertinent n’a été retrouvé. Cela ne prouve pas que le guide ne contient pas la réponse. "
            "Vérifiez la photo, la matière et les guides importés, puis essayez avec l’énoncé complet."
        )
    best = passages[0]
    return (
        "**Statut : passages retrouvés — correspondance à vérifier.**\n\n"
        "**Énoncé recherché**\n\n" + question + "\n\n"
        "**Passage du guide**\n\n" + best["text"] + "\n\n"
        f"**Source :** {best['filename']}, page PDF {best['page']}.\n\n"
        "*Un passage proche n’est pas automatiquement le corrigé exact de l’exercice.*"
    )
