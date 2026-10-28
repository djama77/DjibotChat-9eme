# DjibotChat — Chatbot IA CRIPEN, 9e année

Application Streamlit pour aider les élèves à travailler sur des exercices de 9e année à partir des guides du professeur : import de PDF, photo d'exercice, OCR, recherche de passages et réponse pédagogique avec références aux fichiers et pages.

## Fonctions actuelles

- Import de plusieurs guides PDF et conservation du nom de fichier et du numéro de page.
- Chargement des PDF présents à la racine du dépôt et dans `data/guides_professeurs/` lors de l'indexation.
- Import d'une photo JPG/PNG et OCR local via Tesseract.
- Recherche textuelle des passages les plus proches, avec préférence pour le nom du fichier correspondant à la matière sélectionnée.
- Réponse par GPT-OSS-20B via Vercel AI Gateway, Ollama local ou affichage des extraits sans IA.
- Instruction explicite de signaler quand aucun corrigé suffisamment pertinent n'a été retrouvé au lieu d'inventer une correction officielle.

## Matières visées

Mathématiques, SVT, Physique-Chimie, Français, Anglais, Histoire-Géographie et Informatique. La couverture réelle dépend des guides fournis.

## Déploiement / installation Windows

Python 3.11 ou plus récent recommandé.

```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
streamlit run app.py
```

Installez également Tesseract OCR avec les langues française et anglaise pour la reconnaissance des photos.

## Utiliser GPT-OSS-20B via Vercel AI Gateway

1. Créez une clé dans le tableau de bord Vercel AI Gateway.
2. En local, définissez la variable d'environnement `AI_GATEWAY_API_KEY` ou saisissez la clé dans le panneau latéral de l'application.
3. Sur Streamlit Community Cloud, ajoutez `AI_GATEWAY_API_KEY = "votre_clé"` dans les paramètres **Secrets** de l'application.
4. Ne mettez jamais la clé API dans un fichier versionné sur GitHub.

Modèle par défaut : `openai/gpt-oss-20b`. Le modèle est appelé par l'API compatible OpenAI de Vercel AI Gateway. L'utilisation peut être facturée selon les tarifs en vigueur.

## Utiliser Ollama localement (option alternative)

```powershell
ollama pull qwen2.5:3b
```

Activez ensuite « Ollama local » et vérifiez que le service Ollama tourne sur l'ordinateur qui exécute l'application.

## Guides PDF

Les guides peuvent être importés depuis l'interface, ajoutés à la racine du dépôt ou placés dans `data/guides_professeurs/`. N'ajoutez que des documents que vous êtes autorisé à partager. Les fichiers PDF scannés dont les pages ne contiennent aucune couche texte ne sont pas encore indexés par OCR automatique.

## Limites importantes

- La recherche actuelle est une recherche textuelle par mots-clés, pas encore une recherche sémantique vectorielle.
- L'OCR de photo utilise Tesseract et peut mal lire les formules, tableaux ou schémas : relisez le texte extrait.
- Une page de guide qui ne contient pas de texte sélectionnable peut ne pas être exploitable.
- Un passage proche ne prouve pas à lui seul qu'il s'agit du corrigé exact. Vérifiez toujours les sources et pages affichées.
- Pour une application publique, il faudra tester les guides réels, ajouter des tests automatisés et surveiller les quotas de l'API.

## Structure

- `app.py` : interface Streamlit.
- `app/core.py` : extraction PDF, OCR, recherche et appels GPT-OSS/Ollama.
- `data/guides_professeurs/` : emplacement facultatif des guides PDF locaux.
