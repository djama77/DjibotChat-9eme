/**
 * Référentiel de révision arabe – 9e année, préparé à partir des éléments
 * transmis par l'utilisateur et des liens institutionnels indiqués.
 *
 * La répartition en Mois 1 / Mois 2 est une proposition pédagogique :
 * elle ne constitue pas un calendrier officiel publié par le CRIPEN.
 */
export const ARABIC_CURRICULUM_REFERENCE = {
  title: "Révision BEF – Arabe – 9e année",
  status: "Référentiel pédagogique de travail, à vérifier sur les PDF officiels",
  sources: [
    {
      label: "Guide de l'enseignant en langue arabe – 9e année (édition 2022-2023)",
      url: "https://education.dj/portail/metier/guides/9eme/arabe.pdf",
      institution: "CRIPEN / Ministère de l'Éducation nationale de Djibouti",
    },
    {
      label: "Manuels expérimentaux de 9e année",
      url: "https://www.education.dj/portail/manuelexpMoy.php",
      institution: "Ministère de l'Éducation nationale de Djibouti",
    },
    {
      label: "Site du CRIPEN",
      url: "https://cripen.dj/",
      institution: "CRIPEN",
    },
  ],
  months: [
    {
      month: 1,
      unit: "الوحدة الأولى: شخصيات ومواقف",
      translation: "Unité 1 – Personnalités et situations",
      lessons: [
        { type: "Texte oral", title: "مجدي يعقوب", note: "Magdi Yacoub" },
        { type: "Dialogue", title: "Rosa Parks" },
        { type: "Texte de lecture", title: "صفات الحاكم العادل", note: "Les qualités d'un dirigeant juste" },
        { type: "Texte oral", title: "علي بنات", note: "Ali Banat" },
        { type: "Dialogue", title: "Muhammad Ali" },
        { type: "Poème", title: "قصيدة الحرية", note: "Le poème de la liberté" },
      ],
      languageFocus: [
        { arabic: "النفي والإثبات", french: "Négation et affirmation" },
        { arabic: "الاستفهام", french: "Interrogation" },
      ],
      skills: [
        "Lecture et compréhension de textes",
        "Rédaction d'une lettre administrative",
        "Expression orale et présentation d'une personnalité",
      ],
    },
    {
      month: 2,
      unit: "الوحدة الثانية: مهن المستقبل",
      translation: "Unité 2 – Les métiers du futur",
      lessons: [
        { type: "Texte oral", title: "مطور البرامج", note: "Développeur informatique" },
        { type: "Lecture", title: "ماذا ستفعل البشرية في مستقبل لا وظائف فيه؟" },
        { type: "Texte oral", title: "المهندس الزراعي", note: "Ingénieur agronome" },
        { type: "Poème", title: "العمل", note: "Le travail" },
      ],
      languageFocus: [
        { arabic: "التعجب القياسي", french: "L'exclamation selon les formes grammaticales" },
        { arabic: "التعجب السماعي", french: "L'exclamation d'usage" },
      ],
      skills: [
        "Compréhension et résumé de textes",
        "Dialogue sur la sécurité informatique",
        "Vocabulaire des métiers et du commerce électronique",
        "Rédaction et présentation orale",
      ],
    },
  ],
  lessonTemplate: [
    "Cours en arabe avec explication en français",
    "Vocabulaire arabe-français",
    "Règles grammaticales accompagnées d'exemples",
    "Exercices progressifs",
    "Corrigés expliqués",
    "Petite évaluation avec notation",
  ],
} as const;

export const ARABIC_CURRICULUM_INSTRUCTION = [
  "Pour les demandes « Révision BEF Commun », « arabe 9e année », ou la préparation des deux premiers mois, utilise ce référentiel comme plan de révision.",
  "Organise les séquences autour des deux unités, de leurs textes, dialogues, poèmes, points de langue et compétences indiqués.",
  "Pour chaque leçon, privilégie les six rubriques du modèle : cours arabe-français, vocabulaire, grammaire et exemples, exercices progressifs, corrigés expliqués, évaluation notée.",
  "La répartition des unités en Mois 1 et Mois 2 est une proposition de progression et non un calendrier officiel CRIPEN. Ne la présente jamais comme officielle.",
  "Les titres et contenus de leçons ci-dessous sont une synthèse de travail transmise par l'utilisateur. Pour citer précisément le guide, confirmer une formulation, un ordre, une page ou un exercice, consulter le PDF officiel et citer uniquement les éléments effectivement vérifiés.",
  "Les liens institutionnels sont des pistes documentaires ; un guide de l'enseignant ou un manuel n'est pas automatiquement un corrigé officiel d'annale BEF.",
].join("\n");
