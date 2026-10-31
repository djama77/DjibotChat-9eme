# Ressources officielles de Djibouti — corpus élève de 9e année

Dépôt : djama77/DjibotChat-9eme  
Branche : refactor/official-first-rag  
Mise à jour : 2026-10-31

## Objectif

Compléter l'inventaire des PDF déjà présents dans le dépôt avec les ressources publiques du CRIPEN / Education.dj. Ce fichier est un registre de liens et de vérification, pas une copie des documents. Aucun PDF externe n'est ajouté automatiquement au dépôt.

## 1. Manuels expérimentaux de 9e année — Education.dj

Les URL ci-dessous correspondent aux liens PDF identifiés dans le catalogue Education.dj. Avant indexation, télécharger et contrôler la couverture, la classe, l'édition, le nombre de pages et le texte extrait.

| Matière | URL PDF | État du contrôle |
|---|---|---|
| SVT | https://www.education.dj/portail/metier/ManuelsExp/svt9eme.pdf | Lien identifié ; contrôle local complet requis |
| Français | https://www.education.dj/portail/metier/ManuelsExp/manuexpfr.pdf | Lien identifié ; ouverture/téléchargement à contrôler |
| Mathématiques | https://www.education.dj/portail/metier/ManuelsExp/math9eme.pdf | Lien identifié ; contrôle local complet requis |
| Sciences physiques | https://www.education.dj/portail/metier/ManuelsExp/manuexpsp.pdf | Document consulté lors du repérage ; contrôle de version et d'édition requis |
| Arabe | https://www.education.dj/portail/metier/ManuelsExp/Arabe-9eme-Chap1.pdf | Chapitre 1 identifié ; ne pas le traiter comme manuel complet |
| EMCI | https://www.education.dj/portail/metier/ManuelsExp/EMCI-9eme-chap1.pdf | Chapitre 1 identifié ; ne pas le traiter comme manuel complet |
| Histoire-Géographie | https://www.education.dj/portail/metier/ManuelsExp/HG-9eme-chap1.pdf | Lien identifié ; téléchargement et nombre de chapitres à contrôler |

Catalogue de référence : https://www.education.dj/portail/metier/ManuelsExp/

## 2. Informatique — projets interactifs

Espace identifié : https://education.dj/portail/Info/9eme/

| Projet | URL |
|---|---|
| Projet 1 | https://education.dj/portail/Info/9eme/Projet1/index.html |
| Projet 2 | https://education.dj/portail/Info/9eme/Projet2/index.html |
| Projet 3 | https://education.dj/portail/Info/9eme/Projet3/index.html |
| Projet 4 | https://education.dj/portail/Info/9eme/Projet4/index.html |
| Projet 5 | https://education.dj/portail/Info/9eme/Projet5/index.html |
| Projet 6 | https://education.dj/portail/Info/9eme/Projet6/index.html |

Ces pages sont des ressources interactives et non des PDF. Vérifier les contenus, les médias incorporés et les droits avant toute copie ou extraction.

## 3. Curricula officiels

Le CRIPEN publie des curricula disciplinaires. Ils servent à contrôler les compétences, notions et progressions, mais ne doivent pas être indexés comme des manuels d'exercices ni comme des corrigés.

Disciplines repérées dans le catalogue : SVT, mathématiques, physique-chimie, français, anglais, histoire-géographie, informatique, EMCI et vie scolaire.

Point d'entrée institutionnel : https://cripen.dj/

Pour chaque curriculum, relever avant ingestion : URL source exacte, titre, niveau couvert, version/date, pagination et matière. Ne pas supposer qu'un curriculum couvre uniquement la 9e année.

## 4. Annales et corrections BEF

Le catalogue CRIPEN comporte des sujets et éléments de correction BEF 2024 et 2025. Les documents de correction doivent être classés comme « correction d'annale BEF », distincts des guides du professeur et des manuels élèves.

Ressources BEF 2025 repérées :
- Sciences physiques : sujet et correction.
- SVT : sujet et correction.
- Mathématiques : sujet et proposition de correction.
- Français : sujet et éléments de correction.

Portail institutionnel : https://cripen.dj/

Les URL directes des fichiers BEF doivent être enregistrées après ouverture du catalogue et contrôle du fichier correspondant. Ne pas reconstruire ni deviner les URL des fichiers.

## 5. Matières encore incomplètes

- Anglais : curriculum identifié, mais aucun manuel élève de 9e confirmé dans le catalogue des manuels expérimentaux repéré.
- Arabe : un chapitre est identifié ; compléter la collection avant de considérer le corpus comme complet.
- EMCI : un chapitre est identifié ; compléter la collection.
- Histoire-Géographie : lien de chapitre repéré ; confirmer si d'autres chapitres existent.
- Informatique : six projets interactifs repérés ; contrôler leur accessibilité et leur contenu complet.

## 6. Règles d'intégration dans DjibotChat

1. Conserver le PDF original sans modification et calculer son SHA-256 après téléchargement.
2. Enregistrer l'URL officielle, la date de récupération, le titre de couverture, le niveau, la matière, l'édition/version et le nombre de pages.
3. Distinguer obligatoirement les types : `livre_eleve`, `guide_professeur`, `corrige_bef`, `sujet_bef`, `curriculum`, `ressource_interactive`.
4. Indexer les pages en conservant le numéro PDF et le numéro imprimé lorsqu'il est lisible.
5. Ne jamais présenter un curriculum, un sujet ou un passage de cours comme un corrigé officiel.
6. Si le PDF est scanné, appliquer OCR avec contrôle de qualité ; conserver le lien vers la page image.
7. Vérifier les conditions de réutilisation et ne pas publier de copie non autorisée.

## 7. Statut

Ce registre documente les pistes officielles repérées. Il ne signifie pas que les fichiers ont été téléchargés, contrôlés intégralement, ni intégrés à l'index de production. L'ingestion est bloquée tant que les contrôles de provenance, de contenu, de pagination et de qualité ne sont pas terminés.
