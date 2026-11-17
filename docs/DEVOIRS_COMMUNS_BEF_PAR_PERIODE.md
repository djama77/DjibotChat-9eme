# Cahier des charges — Devoirs communs de type BEF par chapitre et période

## Objectif

Ajouter à DjibotChat 9e année un mode de préparation aux devoirs communs inspiré de la structure des évaluations du BEF à Djibouti. L'élève ou l'enseignant doit pouvoir construire un sujet adapté à la progression réellement étudiée, sans supposer qu'un calendrier mensuel est officiellement fixé par le CRIPEN.

Ce mode complète les fonctions de recherche d'exercices, de guides du professeur et d'annales. Il ne remplace pas les sujets officiels du BEF.

## Choix de la couverture du devoir

Le formulaire doit permettre de sélectionner :

1. **Matière** : parmi les matières actives de l'application.
2. **Périmètre du programme** :
   - un chapitre précis ;
   - plusieurs chapitres sélectionnés ;
   - une période de cours : premier mois, deux premiers mois, trois mois, trimestre ou période personnalisée ;
   - révision générale / préparation BEF.
3. **Chapitres réellement étudiés** : l'utilisateur peut sélectionner ou saisir les chapitres concernés. La période ne doit jamais conduire l'IA à inventer une progression officielle.
4. **Format du devoir** : devoir commun d'entraînement, sujet type BEF ou entraînement ciblé sur une compétence.
5. **Durée et notation** : valeurs proposées par défaut, modifiables. Le format courant d'entraînement peut être 1 heure et une note sur 20, mais ces paramètres ne doivent pas être présentés comme des règles officielles universelles.

## Structure attendue du sujet

Chaque sujet généré doit comporter, selon la matière et les chapitres choisis :

- un en-tête : Djibouti, classe de 9e année, matière, type d'évaluation, durée et note ;
- des consignes générales claires ;
- plusieurs exercices progressifs, numérotés et pondérés ;
- des questions de connaissances et de compréhension ;
- des applications, analyses de documents, textes, tableaux, schémas, cartes ou graphiques lorsque la matière s'y prête ;
- une situation-problème ou une tâche de synthèse lorsque cela correspond aux pratiques de la discipline ;
- un barème détaillé dont la somme correspond exactement à la note annoncée.

Le contenu doit rester dans les limites des chapitres sélectionnés. Ne pas introduire une notion non étudiée sans la signaler explicitement.

## Adaptation par matière

Les formes d'exercices doivent être adaptées à la discipline, et non copiées mécaniquement d'une matière à l'autre.

- **SVT** : connaissances, exploitation de documents scientifiques, analyse de résultats, schémas simples, raisonnement et conclusion.
- **Physique-Chimie** : connaissances, unités et grandeurs, exploitation de documents, calculs expliqués, expériences ou situations concrètes.
- **Mathématiques** : calculs, raisonnement, exercices d'application, problèmes et justification des étapes.
- **Français** : compréhension de texte, langue/grammaire, vocabulaire, expression écrite selon les apprentissages ciblés.
- **Arabe** : compréhension, vocabulaire, traduction si prévue dans le programme, grammaire et production ; conserver les voyelles (harakât) lorsque le travail les exige.
- **Anglais** : compréhension, vocabulaire, grammaire et expression selon le niveau et les documents disponibles.
- **Histoire-Géographie** : repères et connaissances, étude de documents, analyse, localisation sur carte muette ou croquis lorsque pertinent.
- **Informatique** : notions, lecture ou analyse de situations, algorithmes et exercices pratiques adaptés au programme.

Cette liste est indicative : les formats exacts doivent être confirmés par les programmes, guides et sujets disponibles pour la matière.

## Corrigé intégral associé

Le corrigé doit reprendre **chaque question**, puis donner immédiatement la réponse attendue. Il doit inclure :

- les étapes de raisonnement et les explications adaptées à un élève de 9e année ;
- les réponses rédigées, calculs détaillés, unités, justifications et conclusions nécessaires ;
- les éléments attendus pour les documents, tableaux, schémas et cartes ;
- le barème question par question et les critères d'attribution des points ;
- une vérification que le total du barème est égal à la note du sujet.

Le sujet et le corrigé doivent pouvoir être exportés ensemble dans un document Word intégral, sans supprimer ni résumer les questions ou les réponses.

## Hiérarchie des sources et transparence

Appliquer la règle « corrigé officiel d'abord » :

1. Rechercher un sujet ou corrigé officiel CRIPEN correspondant exactement à la matière, à la session et à l'exercice.
2. Utiliser les guides du professeur et les manuels CRIPEN pour vérifier les notions, la progression et les méthodes.
3. Si aucune correction officielle correspondante n'existe ou n'est retrouvée, produire un **corrigé pédagogique proposé, non officiel**, clairement étiqueté.
4. Ne jamais transformer un guide, un cours ou un passage ressemblant en corrigé officiel.
5. Ne jamais inventer une annale, une source, une page, un chapitre, une date de programme ou une progression mensuelle.
6. Afficher les références disponibles : titre du document, matière, chapitre, page ou segment, et lien lorsque disponible.
7. Si les documents disponibles ne permettent pas de vérifier un point, le signaler clairement.

Les devoirs créés par l'application doivent porter la mention « Sujet d'entraînement — non officiel », sauf lorsqu'il s'agit de la reproduction vérifiée d'un document officiel autorisé.

## Parcours utilisateur souhaité

1. Ouvrir la rubrique « Devoir commun / Type BEF ».
2. Choisir la matière.
3. Choisir un chapitre, plusieurs chapitres ou une période (ex. : les deux premiers mois).
4. Vérifier ou préciser la liste des chapitres étudiés.
5. Choisir la durée, la note et le niveau de difficulté.
6. Générer le sujet.
7. Consulter le corrigé intégral avec barème et sources.
8. Exporter le sujet seul ou le sujet avec corrigé en Word.

## Exigences de qualité et tests

- Vérifier que le sujet respecte strictement les chapitres sélectionnés.
- Vérifier que chaque question possède un barème et que la somme est exacte.
- Vérifier que le corrigé reprend toutes les questions dans le même ordre.
- Vérifier que les réponses sont cohérentes avec le niveau de 9e année.
- Vérifier que les sources officielles et les propositions IA sont visuellement distinguées.
- Tester au minimum un cas « un chapitre », un cas « deux premiers mois », un cas « plusieurs chapitres » et un cas « révision générale ».
- Tester plusieurs disciplines, notamment SVT, mathématiques, français, arabe et histoire-géographie.
- Tester l'export Word et vérifier que le document contient l'intégralité du sujet et du corrigé.
- Ajouter des tests automatisés pour les validations de périmètre, de barème et de statut officiel/non officiel.

## Exemples d'utilisation

- « Devoir commun de SVT — 9e année — les deux premiers mois — 1 heure — /20 — sujet et corrigé détaillé. »
- « Devoir commun d'Histoire-Géographie — chapitres étudiés depuis la rentrée — 1 heure — /20 — avec documents et carte muette si pertinent. »
- « Évaluation de mathématiques sur les chapitres 1 et 2 — sujet type BEF — corrigé question par question. »

## Statut

Ce document fixe le comportement pédagogique attendu pour la future fonctionnalité. Il ne certifie pas que l'interface et le générateur sont déjà implémentés. L'intégration fonctionnelle devra être réalisée et validée séparément par tests, revue de code et déploiement de prévisualisation avant toute fusion dans `main`.
