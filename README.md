# DjibotChat — assistant scolaire CRIPEN, 9e année

DjibotChat aide à travailler sur les exercices de 9e année à Djibouti à partir des guides du professeur et des annales officielles du BEF. Une réponse générée ne doit jamais être présentée comme un corrigé officiel sans preuve dans le document.

## Deux modes d'utilisation

### Application Streamlit (ordinateur / local)

- Interface : app.py
- Moteur : app/core.py
- OCR photo local avec Tesseract.
- Recherche dans les guides PDF avec conservation du nom de fichier et de la page.
- Réponse par OpenRouter (routeur gratuit) ou Ollama local, ou affichage des extraits sans IA.

Installation Windows :

```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements-streamlit.txt
streamlit run app.py
```

Installez Tesseract OCR avec les langues française et anglaise. Pour OpenRouter, définissez OPENROUTER_API_KEY dans les variables d'environnement ou les secrets de l'hébergeur. Ne placez jamais cette clé dans un fichier versionné.

### Application Next.js (Vercel / Android)

Le projet Next.js se trouve dans vercel-app/. Dans les paramètres Vercel, configurez le Root Directory sur vercel-app, puis ajoutez la variable secrète OPENROUTER_API_KEY.

L'application utilise le modèle routeur openrouter/free. La disponibilité des modèles gratuits et leurs quotas peuvent varier ; aucun modèle payant n'est configuré en secours.

- Photo : Tesseract.js réalise l'OCR dans le navigateur. Le fichier photo n'est pas envoyé à l'API de réponse ; seul le texte reconnu est transmis. Vérifiez les nombres, signes et formules.
- PDF et documents Word : extraction du texte côté serveur.
- Recherche : classement BM25 avec priorité aux passages pertinents provenant d'une correction officielle CRIPEN.
- Sources : les sujets officiels sont identifiés séparément des corrections officielles.
- Annales : catalogue CRIPEN BEF 2024–2025, selon les liens disponibles dans vercel-app/annales.ts.

## Préparer les PDF scannés (traitement local)

Les PDF composés d'images sans couche texte sélectionnable doivent être préparés avant leur indexation. Cette opération est volontairement séparée de l'API Vercel.

Sur Ubuntu/Debian, installez OCRmyPDF et les langues Tesseract :

```bash
sudo apt-get update
sudo apt-get install ocrmypdf tesseract-ocr tesseract-ocr-fra tesseract-ocr-eng
```

Puis lancez le script depuis la racine du dépôt :

```bash
bash vercel-app/scripts/ocr_guides.sh ./guides ./ocr_ready
```

Le script conserve les pages qui possèdent déjà une couche texte et ajoute l'OCR aux pages scannées. Vérifiez les PDF générés avant de les utiliser. Pour le déploiement Vercel actuel, remplacez les PDF sources correspondants dans la branche vercel-deploy par les versions OCR validées, en conservant leurs noms de fichiers.

## Tests

La recherche BM25 possède des tests déterministes. Avec Node.js 22, depuis vercel-app/ :

```bash
node --experimental-strip-types --test lib/retrieval.test.ts
npm install
npm run build
```

Le workflow GitHub Actions est configuré pour exécuter ces tests et construire l'application Next.js.

## Fiabilité et limites

- Un passage pertinent ne prouve pas à lui seul qu'il s'agit du corrigé exact de l'exercice.
- Si aucun extrait de correction officielle correspondant n'est retrouvé, l'application doit le signaler et séparer clairement l'explication pédagogique indépendante.
- L'OCR peut mal reconnaître les formules, tableaux et schémas ; une vérification humaine reste nécessaire.
- La recherche BM25 est lexicale : elle améliore le classement des passages, mais ne remplace pas une recherche sémantique vectorielle.
- Les documents CRIPEN distants peuvent être indisponibles temporairement ; l'application doit afficher les avertissements au lieu d'inventer leur contenu.

## Structure principale

- app.py et app/core.py : application Streamlit et moteur local.
- vercel-app/ : application Next.js destinée à Vercel.
- vercel-app/annales.ts : catalogue des sujets et corrections CRIPEN.
- vercel-app/lib/retrieval.ts : classement BM25.
- vercel-app/scripts/ocr_guides.sh : préparation locale des PDF scannés.
- data/guides_professeurs/ : emplacement facultatif des guides PDF locaux.
