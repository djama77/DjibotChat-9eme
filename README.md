# Chatbot IA CRIPEN — 9e année

Prototype éducatif pour aider les élèves à étudier des exercices à partir d'une photo ou d'un énoncé, en recherchant des extraits dans les guides du professeur au format PDF.

## Fonctionnalités

- Import de plusieurs guides PDF et conservation du nom du fichier et du numéro de page.
- Recherche des passages les plus pertinents.
- Import de photos JPG/PNG et extraction de texte par OCR.
- Réponse de base fondée sur les extraits retrouvés.
- Option d'IA locale via Ollama pour expliquer les étapes en français.

> Ce prototype n'est pas un corrigé officiel. Vérifiez toujours les sources, les calculs et le texte reconnu sur les photos.

## Installation sous Windows

1. Installer Python 3.11 ou plus récent.
2. Ouvrir PowerShell dans le dossier du projet.
3. Exécuter :

```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
streamlit run app.py
```

## Guides du professeur

Créez le dossier `data/guides_professeurs/` et placez-y les PDF que vous êtes autorisé à utiliser. Vous pouvez aussi importer les PDF depuis l'interface.

## OCR

L'OCR des photos nécessite l'application Tesseract installée sur l'ordinateur, avec les langues française et anglaise. Si l'OCR n'est pas disponible, saisissez l'énoncé manuellement.

## IA locale (facultative)

Installez Ollama, puis téléchargez un modèle compatible, par exemple :

```powershell
ollama pull qwen2.5:3b
```

Dans l'application, activez ensuite l'option Ollama. Le modèle doit être disponible sur l'ordinateur où l'application s'exécute.

## Lancement

```powershell
streamlit run app.py
```

## Structure

- `app.py` : interface Streamlit.
- `app/core.py` : extraction PDF, OCR, recherche et génération facultative via Ollama.
- `data/guides_professeurs/` : emplacement des guides PDF locaux.

## État du projet

Version initiale de prototype. Avant un déploiement public, il faut tester les guides CRIPEN réels, ajouter des tests automatisés et sécuriser la configuration du service IA.
