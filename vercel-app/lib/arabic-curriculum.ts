/**
 * Référentiel arabe – 9e année, vérifié sur le guide officiel CRIPEN 2022-2023.
 * Les pages indiquées sont les pages imprimées du guide (pagination PDF + 1).
 *
 * La division en Mois 1 / Mois 2 est une proposition pédagogique, pas un
 * calendrier mensuel officiel publié par le CRIPEN.
 */
export const ARABIC_CURRICULUM_REFERENCE = {
  title: "Révision BEF – Arabe – 9e année",
  status: "Plan de révision vérifié sur le guide officiel CRIPEN 2022-2023",
  sources: [
    {
      label: "Guide de l'enseignant en langue arabe – 9e année (2022-2023)",
      url: "https://education.dj/portail/metier/guides/9eme/arabe.pdf",
      institution: "Centre de recherches, d'information et de production de l'éducation (CRIPEN)",
      pages: "Unité 1 : pp. 13-15 ; Unité 2 : pp. 16-18 ; textes d'écoute de l'unité 2 : pp. 50-51",
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
      scheduleStatus: "Proposition de révision",
      unit: "الوحدة الأولى: شخصيات ومواقف",
      translation: "Unité 1 – Personnalités et situations",
      officialPages: "13-15",
      lessons: [
        {
          lesson: 1,
          type: "Texte d'écoute et dialogue",
          title: "مجدي يعقوب",
          associatedDialogue: "روزا باركس",
          note: "Magdi Yacoub et Rosa Parks",
          page: 13,
        },
        {
          lesson: 2,
          type: "Texte de lecture",
          title: "صفات الحاكم العادل",
          note: "Les qualités d'un dirigeant juste",
          page: 13,
        },
        {
          lesson: 3,
          type: "Texte d'écoute et dialogue",
          title: "علي بنات",
          associatedDialogue: "محمد علي",
          note: "Ali Banat et Muhammad Ali",
          page: 13,
        },
        {
          lesson: 4,
          type: "Poème",
          title: "قصيدة الحرية",
          note: "Le poème de la liberté",
          page: 13,
        },
      ],
      languageFocus: [
        { arabic: "النفي والإثبات", french: "Négation et affirmation", page: 14 },
        { arabic: "الاستفهام", french: "Interrogation", page: 14 },
      ],
      writing: [
        { french: "La lettre administrative", page: 14 },
      ],
      skills: [
        "Comprendre des informations et des idées explicites ou implicites",
        "Organiser les idées et reformuler un texte",
        "Lire en respectant la ponctuation et l'intonation",
        "Distinguer des textes descriptifs, narratifs et argumentatifs",
        "Présenter des informations à l'oral",
      ],
    },
    {
      month: 2,
      scheduleStatus: "Proposition de révision",
      unit: "الوحدة الثانية: مهن المستقبل",
      translation: "Unité 2 – Les métiers du futur",
      officialPages: "16-18",
      lessons: [
        {
          lesson: 1,
          type: "Texte d'écoute et dialogue",
          title: "مطور البرامج",
          associatedDialogue: "بين الصديق والخبير في أمن المعلومات",
          note: "Développeur informatique et dialogue sur la sécurité de l'information",
          page: 16,
        },
        {
          lesson: 2,
          type: "Texte de lecture",
          title: "ماذا ستفعل البشرية في مستقبل لا وظائف فيه؟",
          note: "Que fera l'humanité dans un avenir sans emplois ?",
          page: 16,
        },
        {
          lesson: 3,
          type: "Texte d'écoute et dialogue",
          title: "المهندس الزراعي",
          associatedDialogue: "التجارة الإلكترونية",
          note: "Ingénieur agronome et dialogue sur le commerce électronique",
          page: 16,
        },
        {
          lesson: 4,
          type: "Poème",
          title: "العمل",
          note: "Le travail",
          page: 16,
        },
      ],
      languageFocus: [
        { arabic: "التعجب القياسي", french: "L'exclamation selon les formes grammaticales", page: 17 },
        { arabic: "التعجب السماعي", french: "L'exclamation d'usage", page: 17 },
      ],
      writing: [
        { french: "La rédaction d'une biographie (السيرة)", page: 17 },
      ],
      skills: [
        "Comprendre des enregistrements et des textes de lecture",
        "Repérer les idées principales et secondaires",
        "Organiser et reformuler les informations",
        "Résumer un texte",
        "Développer le vocabulaire des métiers, de la sécurité informatique et du commerce électronique",
        "Présenter des informations à l'oral",
      ],
      linkedActivities: [
        { french: "Constituer un lexique bilingue du commerce électronique", page: 18 },
        { french: "Distinguer intelligence artificielle et technologies numériques", page: 18 },
        { french: "Rechercher des informations sur le droit du travail à Djibouti", page: 18 },
      ],
    },
  ],
  lessonTemplate: [
    "Cours en arabe avec explication en français",
    "Vocabulaire arabe-français",
    "Règles grammaticales accompagnées d'exemples",
    "Exercices progressifs fondés sur les compétences de l'unité",
    "Corrigés expliqués, avec distinction entre corrigé officiel et résolution proposée",
    "Petite évaluation avec notation",
  ],
} as const;

export const ARABIC_CURRICULUM_INSTRUCTION = [
  "Pour les demandes « Révision BEF Commun », « arabe 9e année », ou la préparation des deux premières unités, utilise ce référentiel vérifié sur le guide officiel CRIPEN 2022-2023.",
  "Respecte l'ordre exact des quatre leçons de chaque unité et distingue les textes d'écoute, dialogues, textes de lecture et poèmes.",
  "Pour chaque leçon, privilégie les six rubriques : cours arabe-français, vocabulaire, grammaire et exemples, exercices progressifs, corrigés expliqués, évaluation notée.",
  "La répartition en Mois 1 et Mois 2 est une proposition de révision. Le guide organise les unités et ne décrète pas que chacune correspond à un mois.",
  "Utilise les pages imprimées référencées dans le guide pour les repères : unité 1 pp. 13-15, unité 2 pp. 16-18, textes d'écoute de l'unité 2 pp. 50-51. Ne fabrique jamais une pagination.",
  "Le guide de l'enseignant est une source pédagogique officielle, mais n'est pas automatiquement un corrigé officiel d'une annale BEF. Ne qualifie une réponse de corrigé officiel que si un corrigé CRIPEN correspondant est effectivement retrouvé.",
  "Ne reproduis pas intégralement les textes protégés du manuel ou du guide. Donne des résumés, explications, exercices originaux et courts extraits nécessaires à l'apprentissage.",
].join("\n");
