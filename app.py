import os
from pathlib import Path

import streamlit as st
from PIL import Image

from app.core import extract_pdf_pages, ocr_image, find_relevant_passages, draft_grounded_answer, ask_ollama, ask_gpt_oss

st.set_page_config(page_title="Chatbot CRIPEN — 9e année", page_icon="📚", layout="wide")
st.title("📚 DjibotChat — assistant scolaire CRIPEN, 9e année")
st.caption("Photographiez un exercice, recherchez les passages dans les guides du professeur et obtenez une explication sourcée.")

SUBJECTS = ["Toutes les matières", "Mathématiques", "SVT", "Physique-Chimie", "Français", "Anglais", "Histoire-Géographie", "Informatique"]

def get_secret(name: str, default: str = "") -> str:
    try:
        value = st.secrets.get(name, default)
        if value:
            return str(value)
    except Exception:
        pass
    return os.getenv(name, default)

with st.sidebar:
    st.header("1. Guides du professeur")
    pdfs = st.file_uploader("Importer un ou plusieurs guides PDF", type=["pdf"], accept_multiple_files=True)
    subject = st.selectbox("Matière de l’exercice", SUBJECTS)
    st.caption("Les PDF présents à la racine du dépôt et dans data/guides_professeurs/ sont également chargés automatiquement.")
    st.header("2. Moteur IA")
    engine = st.radio("Choisir le moteur", ["GPT-OSS-20B (Vercel AI Gateway)", "Ollama local", "Sans IA (extraits seulement)"], index=0)
    if engine == "GPT-OSS-20B (Vercel AI Gateway)":
        api_key = st.text_input("Clé Vercel AI Gateway", value=get_secret("AI_GATEWAY_API_KEY"), type="password", help="La clé est lue depuis AI_GATEWAY_API_KEY si elle est configurée dans les secrets.")
        model = st.text_input("Modèle", value="openai/gpt-oss-20b")
        st.caption("Configurez AI_GATEWAY_API_KEY dans les secrets de l’hébergement. Ne publiez jamais cette clé dans GitHub.")
    elif engine == "Ollama local":
        ollama_model = st.text_input("Modèle Ollama", value="qwen2.5:3b")
        ollama_url = st.text_input("Adresse Ollama", value="http://localhost:11434")

if "docs" not in st.session_state:
    st.session_state.docs = []
if "ocr_question" not in st.session_state:
    st.session_state.ocr_question = ""

st.subheader("A. Indexer les guides")
if st.button("Indexer / recharger les guides PDF", type="primary"):
    sources = list(pdfs or [])
    known = {getattr(p, "name", "") for p in sources}
    for directory in (Path("."), Path("data/guides_professeurs")):
        if directory.exists():
            for path in sorted(directory.glob("*.pdf")):
                if path.name not in known:
                    sources.append(path)
                    known.add(path.name)
    if not sources:
        st.warning("Aucun guide PDF trouvé. Importez les fichiers ou ajoutez-les au dépôt/dossier data/guides_professeurs/.")
    else:
        docs, errors = [], []
        progress = st.progress(0)
        for i, pdf in enumerate(sources):
            try:
                raw = pdf.getvalue() if hasattr(pdf, "getvalue") else pdf.read_bytes()
                docs.extend(extract_pdf_pages(raw, getattr(pdf, "name", pdf.name if hasattr(pdf, "name") else "guide.pdf")))
            except Exception as exc:
                errors.append(f"{getattr(pdf, 'name', 'PDF')} : {exc}")
            progress.progress((i + 1) / len(sources))
        st.session_state.docs = docs
        st.success(f"{len(sources) - len(errors)} PDF traité(s), {len(docs)} extraits/pages indexés.")
        if errors:
            for error in errors:
                st.error(error)
        st.info("Les pages numérisées sans texte intégré ne sont pas encore indexées par OCR. Si un guide semble absent, vérifiez qu’il contient du texte sélectionnable.")

st.subheader("B. Photographier ou saisir l’exercice")
photo = st.file_uploader("Importer une photo (JPG, JPEG ou PNG)", type=["jpg", "jpeg", "png"], key="exercise_photo")
if photo:
    image = Image.open(photo).convert("RGB")
    st.image(image, caption="Photo de l’exercice", width=480)
    if st.button("Extraire le texte de la photo (OCR)"):
        try:
            extracted = ocr_image(image)
            st.session_state.ocr_question = extracted
            if extracted:
                st.success("Texte extrait. Relisez-le et corrigez les erreurs avant de rechercher.")
            else:
                st.warning("Aucun texte reconnu. Essayez une photo plus nette ou saisissez l’énoncé manuellement.")
        except Exception as exc:
            st.warning(f"OCR local indisponible : {exc}. Vous pouvez saisir l’énoncé manuellement.")

question = st.text_area("Énoncé reconnu (à relire et corriger)", value=st.session_state.ocr_question, height=150,
                        placeholder="Saisissez l’énoncé, les données, les formules et les questions…")

st.subheader("C. Rechercher et corriger")
if st.button("Rechercher dans les guides et proposer le corrigé", type="primary", use_container_width=True):
    if not question.strip():
        st.warning("Importez une photo et lancez l’OCR, ou saisissez l’énoncé.")
    elif not st.session_state.docs:
        st.warning("Indexez d’abord les guides du professeur dans la section A.")
    else:
        passages = find_relevant_passages(question.strip(), st.session_state.docs, subject)
        st.markdown("### Corrigé et explication")
        if engine == "GPT-OSS-20B (Vercel AI Gateway)":
            try:
                st.markdown(ask_gpt_oss(question.strip(), passages, api_key, model=model.strip()))
            except Exception as exc:
                st.error(f"Impossible de générer avec GPT-OSS-20B : {exc}")
                st.markdown(draft_grounded_answer(question.strip(), passages))
        elif engine == "Ollama local":
            try:
                st.markdown(ask_ollama(question.strip(), passages, model=ollama_model.strip(), base_url=ollama_url.strip()))
            except Exception as exc:
                st.error(f"Impossible de joindre Ollama ou le modèle : {exc}")
                st.markdown(draft_grounded_answer(question.strip(), passages))
        else:
            st.markdown(draft_grounded_answer(question.strip(), passages))
        st.markdown("### Sources retrouvées dans les guides")
        if not passages:
            st.warning("Aucun passage suffisamment pertinent n’a été retrouvé. Ne considérez pas une réponse générale comme un corrigé officiel.")
        for i, passage in enumerate(passages, start=1):
            with st.expander(f"{i}. {passage['filename']} — page PDF {passage['page']} — score {passage['score']:.2f}"):
                st.write(passage["text"])

st.divider()
st.caption("Prototype éducatif. La fiabilité dépend de la qualité des guides, de la photo et de la pertinence des passages retrouvés. Les réponses doivent être vérifiées avec les sources.")
