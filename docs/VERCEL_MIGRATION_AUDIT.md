# Migration Vercel — audit initial

Branche de travail : migration/vercel-fastapi

## État constaté
- Interface historique : Streamlit dans app.py.
- Moteur documentaire : app/core.py, indépendant de Streamlit.
- Recherche : extraction PDF par page puis classement lexical.
- IA : OpenRouter, routeur openrouter/free, clé OPENROUTER_API_KEY.
- OCR : pytesseract nécessite le binaire système Tesseract et les données de langue.
- Guides PDF présents à la racine : fr.pdf, infos.pdf, math9eme.pdf, pc(1).pdf et svt.pdf.
- Les pages PDF sans couche texte sont conservées comme pages vides ; aucun OCR PDF automatique n'est réalisé.
- Les tests existants couvrent le moteur de recherche et le découpage, mais pas encore l'API ni le déploiement Vercel.

## Première tranche réalisée
- Ajout d'une API FastAPI sous api/index.py.
- Endpoints : /api/health, /api/subjects, /api/search et /api/answer.
- Chargement en cache mémoire des guides PDF livrés avec le dépôt.
- Clé OpenRouter lue exclusivement côté serveur.
- Ajout d'une interface web statique minimale dans public/index.html.
- Ajout de la configuration de routage Vercel.
- Dépendances Streamlit conservées pour ne pas casser l'application historique.

## Limites non résolues avant production
1. OCR photo : pytesseract seul n'installe pas le moteur Tesseract. Tester le binaire et les langues sur le runtime Vercel avant d'activer l'OCR.
2. Import de PDF volumineux : ne pas envoyer des fichiers de plusieurs Mo au travers d'une fonction Vercel ; prévoir stockage objet et ingestion séparée si nécessaire.
3. L'index PDF est construit à la première requête de chaque instance froide ; mesurer le temps et la mémoire avec l'ensemble réel des guides.
4. L'interface web initiale accepte le texte, pas encore caméra/galerie/OCR.
5. Le fonctionnement réel dépend du test de build et d'une Preview Vercel avec OPENROUTER_API_KEY configurée.

Ne pas fusionner vers main ni remplacer la production avant tests automatisés et validation mobile.
