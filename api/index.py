"""FastAPI adapter for Vercel. Keeps the existing school retrieval engine in app/core.py."""
from functools import lru_cache
from pathlib import Path
import os

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

from app.core import extract_pdf_pages, find_relevant_passages, ask_openrouter, draft_grounded_answer

ROOT = Path(__file__).resolve().parents[1]
SUBJECTS = ["Toutes les matières", "Mathématiques", "SVT", "Physique-Chimie", "Français", "Anglais", "Histoire-Géographie", "Informatique"]

app = FastAPI(title="DjibotChat 9e année API", version="1.0.0")

class ExerciseRequest(BaseModel):
    question: str = Field(min_length=3, max_length=12000)
    subject: str = "Toutes les matières"
    use_ai: bool = True

@lru_cache(maxsize=1)
def load_repository_guides():
    documents = []
    candidates = list(ROOT.glob("*.pdf")) + list((ROOT / "data" / "guides_professeurs").glob("*.pdf"))
    for path in sorted(set(candidates)):
        try:
            documents.extend(extract_pdf_pages(path.read_bytes(), path.name))
        except Exception:
            # One malformed PDF must not prevent the other guides from loading.
            continue
    return documents

@app.get("/api/health")
def health():
    docs = load_repository_guides()
    return {"status": "ok", "service": "djibotchat-api", "indexed_passages": len(docs)}

@app.get("/api/subjects")
def subjects():
    return {"subjects": SUBJECTS}

@app.post("/api/search")
def search(request: ExerciseRequest):
    docs = load_repository_guides()
    if not docs:
        raise HTTPException(status_code=503, detail="Aucun guide PDF lisible n'est disponible dans le déploiement.")
    passages = find_relevant_passages(request.question, docs, request.subject)
    return {"passages": passages, "count": len(passages), "warning": None if passages else "Aucun passage suffisamment pertinent retrouvé."}

@app.post("/api/answer")
def answer(request: ExerciseRequest):
    docs = load_repository_guides()
    if not docs:
        raise HTTPException(status_code=503, detail="Aucun guide PDF lisible n'est disponible dans le déploiement.")
    passages = find_relevant_passages(request.question, docs, request.subject)
    if request.use_ai:
        key = os.getenv("OPENROUTER_API_KEY", "").strip()
        if not key:
            raise HTTPException(status_code=503, detail="OPENROUTER_API_KEY n'est pas configurée sur Vercel.")
        try:
            result = ask_openrouter(request.question, passages, key)
        except Exception as exc:
            raise HTTPException(status_code=502, detail=f"OpenRouter indisponible : {str(exc)[:300]}") from exc
    else:
        result = draft_grounded_answer(request.question, passages)
    return {"answer": result, "passages": passages, "source_count": len(passages)}
