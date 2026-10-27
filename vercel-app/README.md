# DjibotChat 9e année — version Vercel

Version web compatible avec Vercel/Next.js, ajoutée dans `vercel-app/` sans remplacer l’application Streamlit originale (`app.py`).

## Déploiement
- Configurer le projet Vercel avec le répertoire racine `vercel-app`.
- Framework : Next.js.
- Ajouter `GEMINI_API_KEY` dans les variables d’environnement Vercel (Production, Preview et Development selon le besoin).
- Redéployer après l’ajout de la variable.

## Utilisation
L’élève saisit l’exercice et téléverse jusqu’à 8 PDF (8 Mo chacun). L’application extrait le texte des PDF, recherche des passages et demande une explication à Gemini. Les PDF numérisés sans couche texte ne sont pas reconnus par cette version ; l’OCR photo et Ollama local de la version Streamlit originale ne sont pas inclus ici.

La clé Gemini est lue uniquement côté serveur depuis `GEMINI_API_KEY` et ne doit jamais être publiée dans le dépôt.
