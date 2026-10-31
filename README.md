# DjibotChat — assistant scolaire CRIPEN, 9e année

DjibotChat propose deux modes d'utilisation construits autour du même moteur documentaire Python :

- **Application web Vercel** : interface mobile dans `public/index.html`, API FastAPI dans `api/index.py`.
- **Application Streamlit locale** : interface historique dans `app.py`, utile pour les essais sur ordinateur.

## Application web Vercel

Le dépôt contient une application FastAPI compatible avec les fonctions Python de Vercel. La configuration se trouve dans `vercel.json`.

Routes disponibles :

- `/` : interface web responsive.
- `/api/health` : état du service et nombre de passages indexés.
- `/api/subjects` : matières proposées par l'API.
- `/api/search` : recherche de passages dans les guides.
- `/api/answer` : réponse fondée sur les passages retrouvés.

### Configuration

Dans les variables d'environnement Vercel, définir :

- `DEEPSEEK_API_KEY` : clé privée DeepSeek utilisée côté serveur.
- `DEEPSEEK_MODEL` (facultatif) : modèle à utiliser ; valeur par défaut `deepseek-flash`.

L'API utilise l'endpoint compatible OpenAI `https://api.deepseek.com/chat/completions`.

Ne jamais placer une clé API dans le code, dans un fichier public ou dans Git.

L'API DeepSeek est facturée selon le modèle et le volume de jetons ; consultez les tarifs et quotas officiels. Sans clé, l'API renvoie une erreur de configuration lorsque la génération IA est demandée.

### Vérification après déploiement

Tester dans cet ordre :

1. Ouvrir `/` et vérifier l'affichage sur téléphone.
2. Ouvrir `/api/health` et confirmer que des passages PDF sont indexés.
3. Ouvrir `/api/subjects` et vérifier les matières affichées.
4. Envoyer un exercice de test à `/api/search`.
5. Tester `/api/answer` avec une clé configurée, puis sans IA si nécessaire.

Un build réussi ne prouve pas à lui seul que les PDF sont correctement indexés ni que les réponses sont exactes. La disponibilité réelle de Vercel doit être vérifiée dans le tableau de bord du projet.

## Application Streamlit locale

L'interface historique reste disponible dans `app.py`.

Prérequis : Python 3.11 ou plus récent, Tesseract OCR installé avec les langues française et anglaise.

```bash
python -m venv .venv
# Windows : .venv\\Scripts\\activate
# Linux/macOS : source .venv/bin/activate
pip install -r requirements-streamlit.txt
streamlit run app.py
```

Le moteur local peut utiliser Ollama ou afficher les extraits retrouvés sans IA. Pour la configuration Streamlit, consulter les paramètres et secrets de l'environnement choisi.

## Documents et indexation

Les guides PDF présents à la racine du dépôt et dans `data/guides_professeurs/` sont chargés par l'API au démarrage de chaque instance froide.

Fichiers actuellement repérés à la racine :

- `svt.pdf`
- `math9eme.pdf`
- `pc(1).pdf`
- `fr.pdf`
- `infos.pdf`

L'affectation de `infos.pdf` à une matière doit être confirmée par lecture de sa couverture. La présence d'un fichier ne prouve pas que son contenu est intégralement exploitable.

Les PDF scannés sans couche texte ne sont pas encore indexés automatiquement par OCR côté serveur. L'OCR de la photo de l'élève s'effectue dans le navigateur ; la photo n'est pas envoyée au serveur par cette fonction.

## Règle pédagogique : corrigé officiel d'abord

DjibotChat doit distinguer clairement :

1. **Corrigé officiel retrouvé** : uniquement si une correction officielle correspondante est identifiée dans les documents.
2. **Passage pédagogique retrouvé** : extrait pertinent d'un cours ou d'un guide, sans prétendre qu'il s'agit du corrigé exact.
3. **Corrigé introuvable** : aucune source suffisamment pertinente n'a été retrouvée.

Un passage proche n'est pas automatiquement un corrigé officiel. Les réponses générées par IA doivent être vérifiées avec le document et la page affichés. Ne jamais inventer de source, de chapitre ou de pagination.

## Tests

Les tests Python sont exécutés par GitHub Actions à chaque push sur `main` et à chaque pull request vers `main`.

```bash
pip install -r requirements.txt
pip install pytest
pytest -q
```

## Structure principale

- `api/index.py` : API FastAPI pour Vercel.
- `public/index.html` : interface web et OCR navigateur.
- `app/core.py` : extraction PDF, recherche documentaire et réponses sourcées.
- `app.py` : interface Streamlit historique.
- `requirements.txt` : dépendances de l'API Vercel.
- `requirements-streamlit.txt` : dépendances de l'interface Streamlit.
- `tests/` : tests de régression.
- `docs/` : inventaire et règles documentaires.

## Limites connues

- La recherche actuelle est lexicale ; elle n'utilise pas encore de recherche vectorielle/embeddings.
- Les PDF scannés nécessitent une ingestion OCR dédiée.
- L'OCR navigateur peut mal lire les formules, tableaux ou schémas : relire et corriger le texte extrait.
- La présence d'un passage pertinent ne garantit pas que l'exercice exact a été retrouvé.
- La précision pédagogique doit être mesurée sur un jeu d'exercices annotés avant toute promesse de fiabilité.
