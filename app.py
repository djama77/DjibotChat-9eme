from pathlib import Path

import requests
import streamlit as st
from PIL import Image

from app.core import (
    extract_pdf_pages,
    ocr_image,
    find_relevant_passages,
    draft_grounded_answer,
    ask_ollama,
)

st.set_page_config(page_title="Chatbot CRIPEN — 9e année", page_icon="📚", layout="wide")
st.title("📚 Chatbot IA scolaire — CRIPEN 9e année")
st.caption("Photo d’exercice + guides du professeur PDF → recherche de sources → explication facultative par IA locale.")

SUBJECTS = [
    "Toutes les matières", "Mathématiques", "SVT", "Physique-Chimie",
    "Français", "Anglais", "Histoire-Géographie", "Informatique",
]

with st.sidebar:
    st.header("1. Documents pédagogiques")
    pdfs = st.file_uploader(
        "Importer les guides du professeur (PDF)",
        type=["pdf"],
        accept_multiple_files=True,
    )
    st.caption("Pour les conserver localement, placez les PDF dans data/guides_professeurs/.")
    subject = st.selectbox("Matière", SUBJECTS)
    st.header("2. IA locale (facultative)")
    use_ai = st.toggle("Générer une réponse avec Ollama", value=False)
    model = st.text_input("Nom du modèle Ollama", value="qwen2.5:3b", disabled=not use_ai)
    ollama_url = st.text_input("Adresse Ollama", value="http://localhost:11434", disabled=not use_ai)
    if use_ai:
        st.info("Ollama et le modèle choisi doivent être installés sur l'ordinateur qui exécute l'application.")

if "docs" not in st.session_state:
    st.session_state.docs = []
if "ocr_question" not in st.session_state:
    st.session_state.ocr_question = ""

st.subheader("A. Charger les guides")
if st.button("Indexer les guides PDF", type="primary"):
    sources = list(pdfs or [])
    for path in sorted(Path("data/guides_professeurs").glob("*.pdf")):
        sources.append(path)
    if not sources:
        st.warning("Importez au moins un guide PDF ou placez-en dans data/guides_professeurs/.")
    else:
        docs, errors = [], []
        progress = st.progress(0)
        for i, pdf in enumerate(sources):
            try:
                raw = pdf.read() if hasattr(pdf, "read") else pdf.read_bytes()
                name = getattr(pdf, "name", "guide.pdf")
                docs.extend(extract_pdf_pages(raw, name))
            except Exception as exc:
                errors.append(f"{getattr(pdf, 'name', 'PDF')} : {exc}")
            progress.progress((i + 1) / len(sources))
        st.session_state.docs = docs
        st.success(f"Indexation terminée : {len(docs)} extraits/pages traités.")
        for error in errors:
            st.error(error)

st.subheader("B. Photographier ou saisir l’exercice")
photo = st.file_uploader("Importer une photo (JPG ou PNG)", type=["jpg", "jpeg", "png"], key="exercise_photo")
if photo:
    image = Image.open(photo).convert("RGB")
    st.image(image, caption="Photo de l’exercice", width=480)
    if st.button("Extraire le texte de la photo (OCR)"):
        try:
            extracted = ocr_image(image)
            st.session_state.ocr_question = extracted
            if extracted:
                st.success("Texte extrait. Relisez-le et corrigez les erreurs ci-dessous.")
            else:
                st.warning("Aucun texte reconnu. Essayez une photo plus nette ou saisissez l’énoncé manuellement.")
        except Exception as exc:
            st.error(f"OCR indisponible : {exc}. Installez Tesseract ou saisissez l’énoncé.")

question = st.text_area(
    "Énoncé (à vérifier après OCR)",
    value=st.session_state.ocr_question,
    height=150,
    placeholder="Saisissez l’énoncé, les données et les questions…",
)

st.subheader("C. Rechercher et résoudre")
if st.button("Trouver les passages et proposer une réponse", type="primary", use_container_width=True):
    if not question.strip():
        st.warning("Importez une photo et lancez l’OCR, ou saisissez l’énoncé.")
    else:
        passages = find_relevant_passages(question, st.session_state.docs, subject)
        st.markdown("### Réponse")
        if use_ai:
            try:
                answer = ask_ollama(question.strip(), passages, model=model.strip(), base_url=ollama_url.strip())
                st.markdown(answer)
            except requests.exceptions.RequestException as exc:
                st.error(f"Impossible de joindre Ollama ou le modèle : {exc}")
                st.info("Vérifiez qu'Ollama est démarré et que le modèle est installé.")
                st.markdown(draft_grounded_answer(question.strip(), passages))
            except Exception as exc:
                st.error(f"Erreur pendant la génération : {exc}")
                st.markdown(draft_grounded_answer(question.strip(), passages))
        else:
            st.markdown(draft_grounded_answer(question.strip(), passages))
        st.markdown("### Sources retrouvées")
        if not passages:
            st.warning("Aucun passage pertinent n’a été trouvé dans les guides indexés. Vérifiez l’énoncé, la matière et les PDF.")
        for i, passage in enumerate(passages, start=1):
            with st.expander(
                f"{i}. {passage['filename']} — page PDF {passage['page']} — pertinence {passage['score']:.2f}"
            ):
                st.write(passage["text"])

st.divider()
st.caption("Prototype en cours de développement. La qualité dépend des guides fournis, de la lisibilité de la photo et du modèle local. Vérifiez toujours les réponses et les sources.")
