# Refondation DjibotChat — corrigé officiel d'abord

## Décision produit
DjibotChat doit séparer strictement trois résultats :
1. **Corrigé officiel retrouvé** : uniquement lorsqu'un corrigé identifié comme tel existe dans le corpus et que l'exercice est apparié de manière vérifiable.
2. **Passages pédagogiques retrouvés** : extraits de cours ou guide pertinents, sans prétendre qu'ils constituent le corrigé.
3. **Aucune source suffisamment pertinente** : ne pas fabriquer de réponse officielle.

L'IA intervient après la recherche documentaire, pour reformuler/expliquer les extraits. Elle ne décide pas seule qu'une réponse est officielle.

## Architecture cible
- Ingestion : PDF texte et PDF scannés, avec OCR de secours et contrôle qualité.
- Métadonnées obligatoires : matière, niveau, type_document (guide/corrigé/annale/cours), chapitre, page imprimée si détectable, page PDF, fichier et empreinte du document.
- Découpage : conserver les frontières page/section/exercice ; ne pas mélanger deux exercices dans un même passage.
- Recherche hybride : BM25/mots-clés + embeddings multilingues, filtrés par matière et type de document.
- Reranking : classer les passages et conserver les raisons de correspondance.
- Réponse : priorité à un corrigé officiel exact ; sinon explication pédagogique explicitement non officielle.
- Vérification : calculs numériques/unités lorsque possible ; références contrôlées contre les métadonnées réelles.
- Traçabilité : conserver la version du corpus, les passages retenus, le modèle et le statut de vérification.

## Garde-fous non négociables
- Ne jamais appeler « corrigé officiel » un simple passage de cours.
- Ne jamais inventer fichier, chapitre, page, citation ou résultat de calcul.
- Si OCR incertain ou source faible : demander de corriger la transcription ou afficher « à vérifier ».
- Le modèle ne doit pas compléter une source manquante par une affirmation présentée comme officielle.
- Une réponse sans preuve documentaire peut être une explication générale, clairement étiquetée.

## Étapes de réalisation
1. Inventaire et audit des PDF existants (lisibilité, matière, pages, doublons, scans).
2. Schéma de métadonnées et manifeste du corpus.
3. Tests de recherche avec exercices annotés par matière et source attendue.
4. Recherche hybride et évaluation Recall@k / précision des sources.
5. Séparation UI des statuts officiel / pédagogique / introuvable.
6. Validation des calculs et OCR sur Android.
7. Déploiement progressif après tests.

## Critères de recette
- 100 % des références affichées doivent exister dans le corpus.
- Aucun passage de cours ne doit être étiqueté corrigé officiel.
- Les exercices de test sans source doivent produire un statut introuvable ou explication générale non officielle.
- Mesurer Recall@5 et précision des sources sur un jeu d'au moins 100 exercices ; les seuils de lancement seront fixés après mesure de référence.
- Tester chaque matière, les PDF scannés, les tableaux, les signes mathématiques et les exercices photographiés.

## Hors périmètre de cette première étape
Pas de changement de fournisseur IA, pas de suppression de l'application actuelle, pas de migration de base de données ni de promesse de précision avant évaluation.
