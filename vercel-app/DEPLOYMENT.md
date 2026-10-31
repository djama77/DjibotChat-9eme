# Déploiement Vercel — DjibotChat 9e

## Configuration du projet

- Framework : Next.js
- Root Directory : `vercel-app`
- Build : `npm run build`
- Variable secrète requise à l'exécution : `OPENROUTER_API_KEY`

Le dépôt contient aussi l'application Streamlit et l'adaptateur FastAPI à la racine. Le projet Vercel `djibotchat-9eme-app` doit donc construire le sous-dossier `vercel-app`, et non la racine du dépôt.

## Contrôle avant publication

1. Vérifier le build Preview Vercel.
2. Vérifier la variable `OPENROUTER_API_KEY` dans l'environnement Preview.
3. Tester une question écrite.
4. Tester une photo JPG/PNG/WEBP et contrôler la transcription OCR.
5. Tester une recherche BEF en choisissant une matière et une session.
6. Vérifier que les sources affichées distinguent les corrections officielles, les sujets officiels et les guides.

Ne pas promouvoir une Preview vers la production tant que ces contrôles ne sont pas terminés.
