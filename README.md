---
title: DjibotChat — 9e année
emoji: 📚
colorFrom: blue
colorTo: green
sdk: streamlit
sdk_version: 1.55.0
app_file: app.py
pinned: false
---

# DjibotChat — assistant scolaire CRIPEN, 9e année

Application Streamlit pour travailler sur les exercices de 9e année à partir des guides du professeur : photo depuis la caméra ou la galerie, OCR, recherche de passages et explications sourcées.

## Hébergement recommandé

**Cette application est une application Python/Streamlit. Elle ne peut pas être servie comme une application web native par un déploiement Vercel standard.** Vercel peut conserver le dépôt connecté, mais son URL de visite ne lance pas le serveur Streamlit. Utilisez plutôt [Hugging Face Spaces](https://huggingface.co/new-space) (SDK Streamlit) ou [Streamlit Community Cloud](https://share.streamlit.io/).

### Déploiement sur Hugging Face Spaces

1. Créez un Space et choisissez **Streamlit** comme SDK.
2. Importez ou reliez le dépôt `djama77/DjibotChat-9eme`.
3. Dans **Settings → Variables and secrets**, ajoutez le secret `OPENROUTER_API_KEY` avec votre clé OpenRouter.
4. Le Space installe les dépendances de `requirements.txt` et les paquets système de `packages.txt`.
5. Ouvrez l'application une fois le statut du Space passé à **Running**.

Ne placez jamais la clé API dans GitHub, dans le code ou dans un fichier public.

## Fonctionnalités

- Import de plusieurs guides PDF et conservation du nom de fichier et du numéro de page.
- Chargement des PDF présents à la racine du dépôt et dans `data/guides_professeurs/` lors de l'indexation.
- Prise de photo avec la caméra ou sélection depuis la galerie (JPG/PNG).
- OCR Tesseract en français et en anglais.
- Recherche textuelle des passages pertinents.
- Réponse par le routeur gratuit OpenRouter (`openrouter/free`), Ollama local ou extraits seulement.
- Signalement explicite lorsqu'aucun corrigé suffisamment pertinent n'a été retrouvé.

## Utilisation locale

Python 3.11 ou plus récent recommandé.

```bash
python -m venv .venv
# Windows : .venv\\Scripts\\activate
# Linux/macOS : source .venv/bin/activate
pip install -r requirements.txt
streamlit run app.py
```

Installez également Tesseract OCR avec les langues française et anglaise.

## Configuration OpenRouter

Définissez le secret `OPENROUTER_API_KEY` dans les paramètres de la plateforme d'hébergement. Le code utilise exclusivement le routeur gratuit `openrouter/free` ; aucun modèle payant n'est configuré en secours. La disponibilité et les quotas des modèles gratuits peuvent varier.

## Sources PDF

Les guides peuvent être importés depuis l'interface, ajoutés à la racine du dépôt ou placés dans `data/guides_professeurs/`. Les PDF scannés sans couche texte sélectionnable ne sont pas encore indexés automatiquement par OCR.

## Limites

- La recherche actuelle repose sur les mots-clés, pas sur des embeddings.
- L'OCR peut mal lire les formules, tableaux ou schémas : relisez le texte extrait.
- Un passage proche ne prouve pas qu'il s'agit du corrigé exact. Vérifiez les références affichées.
