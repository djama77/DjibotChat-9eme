# Inventaire documentaire — DjibotChat 9e année

Date du relevé : 2026-10-31
Dépôt : djama77/DjibotChat-9eme
Branche de travail : refactor/official-first-rag

## 1. Fichiers PDF détectés à la racine de main

Les tailles ci-dessous proviennent des métadonnées Git du dépôt. Les matières sont des hypothèses fondées sur les noms de fichiers ; le contenu interne des PDF n'a pas encore été validé page par page.

| Fichier | Taille (octets) | Affectation provisoire | Vérification requise |
|---|---:|---|---|
| svt.pdf | 6 581 733 | SVT | Titre, niveau, chapitres, pages, texte/OCR, présence de corrigés |
| math9eme.pdf | 7 274 450 | Mathématiques | Titre, niveau, chapitres, pages, texte/OCR, présence de corrigés |
| pc(1).pdf | 2 098 107 | Physique-chimie | Titre, niveau, chapitres, pages, texte/OCR, présence de corrigés |
| fr.pdf | 1 067 349 | Français | Titre, niveau, chapitres, pages, texte/OCR, présence de corrigés |
| infos.pdf | 1 680 769 | À identifier | Lire la couverture et la table des matières avant de classer |

**Total détecté : 5 PDF, 18 702 408 octets (environ 17,84 Mio).**

## 2. Matières et ressources non PDF

| Matière | État observé dans l'arborescence | Action |
|---|---|---|
| Anglais | Un fichier pédagogique Markdown existe : docs/anglais/reseaux-sociaux-5-phrases.md. Aucun PDF anglais identifié à la racine. | Rechercher/ajouter le guide officiel PDF ; conserver le Markdown comme ressource complémentaire identifiée. |
| Histoire-géographie | Aucun PDF ou dossier dédié identifié dans l'arborescence actuelle. | Rechercher/ajouter les documents de référence. |
| Informatique | infos.pdf existe, mais son contenu n'est pas encore vérifié. | Identifier précisément le document avant de l'affecter à l'informatique. |

## 3. Limites de cet inventaire

- Ce relevé confirme les noms, tailles et chemins des fichiers, pas leur contenu pédagogique.
- Le nombre de pages, les titres exacts, les chapitres, les pages imprimées, la qualité OCR et la présence de corrigés restent à relever par lecture des PDF.
- Ne pas considérer un guide du professeur comme un corrigé officiel sans preuve explicite.
- Ne pas créer d'exercices de référence à partir d'un contenu supposé.
- Les documents manquants doivent être signalés, jamais remplacés par des sources inventées.

## 4. Prochaine étape : audit PDF détaillé

Pour chaque PDF, relever :
1. Métadonnées techniques : pages, taille, version et empreinte SHA-256.
2. Couverture : titre, matière, classe, édition et organisme.
3. Couche texte : pages textuelles, pages scannées, pages mixtes.
4. Structure : chapitres, leçons, exercices, tableaux et figures.
5. Corrigés : présence explicite, emplacement et statut de source.
6. Qualité : pages illisibles, formules altérées, doublons et ordre des pages.

## 5. Règle de constitution du jeu de test

La cible proposée est de 105 exercices (15 par matière). Chaque entrée devra être annotée à partir d'une source vérifiée avec : énoncé, matière, chapitre, document, page PDF, page imprimée si disponible, type de document, corrigé de référence si présent, réponse attendue et critères de notation.

Aucun score de qualité ne sera annoncé avant l'exécution des tests. Les métriques prévues sont notamment Recall@5, précision des sources, exactitude de l'appariement exercice/corrigé et taux de faux corrigés officiels.
