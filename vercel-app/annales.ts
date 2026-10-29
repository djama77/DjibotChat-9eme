export type AnnaleSubject = "Mathématiques" | "SVT" | "Physique-Chimie" | "Français";
export type AnnaleKind = "Sujet officiel" | "Correction officielle";

export type AnnaleResource = {
  year: "2024" | "2025";
  subjects: AnnaleSubject[];
  kind: AnnaleKind;
  title: string;
  url: string;
  format: "doc" | "docx" | "pdf";
};

export const CRIPEN_ANNales: AnnaleResource[] = [
  { year: "2024", subjects: ["SVT", "Physique-Chimie"], kind: "Sujet officiel", title: "Sujet Sciences BEF 2024 (SVT et physique)", url: "https://cripen.dj/wp-content/uploads/2026/04/SUJET-SCIENCES-2024.docx", format: "docx" },
  { year: "2024", subjects: ["SVT"], kind: "Correction officielle", title: "Correction Sciences BEF 2024 — partie SVT", url: "https://cripen.dj/wp-content/uploads/2026/04/CORRIGE-partie-SVT-2024.docx", format: "docx" },
  { year: "2024", subjects: ["Physique-Chimie"], kind: "Correction officielle", title: "Correction Sciences BEF 2024 — partie physique", url: "https://cripen.dj/wp-content/uploads/2026/04/Correction_partie-physique-2024.docx", format: "docx" },
  { year: "2024", subjects: ["Mathématiques"], kind: "Sujet officiel", title: "Sujet Maths BEF 2024", url: "https://cripen.dj/wp-content/uploads/2026/04/Sujet-1-math-bef-2024.doc", format: "doc" },
  { year: "2024", subjects: ["Mathématiques"], kind: "Correction officielle", title: "Correction Maths BEF 2024", url: "https://cripen.dj/wp-content/uploads/2026/04/Correction-sujet-1math-bef-2024.doc", format: "doc" },
  { year: "2024", subjects: ["Français"], kind: "Sujet officiel", title: "Sujet Français BEF 2024", url: "https://cripen.dj/wp-content/uploads/2026/04/SUJET-1fr-bef-2024.docx", format: "docx" },
  { year: "2024", subjects: ["Français"], kind: "Correction officielle", title: "Correction Français BEF 2024", url: "https://cripen.dj/wp-content/uploads/2026/04/Corrige-du-sujet-1fr-bef-2024.docx", format: "docx" },
  { year: "2025", subjects: ["Physique-Chimie"], kind: "Sujet officiel", title: "Sujet Sciences PC BEF 2025", url: "https://cripen.dj/wp-content/uploads/2026/04/SCIENCES-PARTIE-PC-Sujet-1_-finale2025.pdf", format: "pdf" },
  { year: "2025", subjects: ["Physique-Chimie"], kind: "Correction officielle", title: "Correction Sciences PC BEF 2025", url: "https://cripen.dj/wp-content/uploads/2026/04/SCIENCES-PARTIE-PC-correction-sujet-1-final2025.pdf", format: "pdf" },
  { year: "2025", subjects: ["SVT"], kind: "Sujet officiel", title: "Sujet Sciences SVT BEF 2025", url: "https://cripen.dj/wp-content/uploads/2026/04/SUJET-1-SCIENCES-2025-PARTIE-SVT-.pdf", format: "pdf" },
  { year: "2025", subjects: ["SVT"], kind: "Correction officielle", title: "Correction Sciences SVT BEF 2025", url: "https://cripen.dj/wp-content/uploads/2026/04/CORRIGE-CRITERIE-SUJET-1-SCIENCES-2025-PARTIE-SVT-.pdf", format: "pdf" },
  { year: "2025", subjects: ["Mathématiques"], kind: "Sujet officiel", title: "Sujet Maths BEF 2025", url: "https://cripen.dj/wp-content/uploads/2026/04/MATHS-BEF2025_Sujet-1.pdf", format: "pdf" },
  { year: "2025", subjects: ["Mathématiques"], kind: "Correction officielle", title: "Correction Maths BEF 2025", url: "https://cripen.dj/wp-content/uploads/2026/04/MATHS-Proposition_De_Correction_BEF_2025-version-finale.pdf", format: "pdf" },
  { year: "2025", subjects: ["Français"], kind: "Sujet officiel", title: "Sujet Français BEF 2025", url: "https://cripen.dj/wp-content/uploads/2026/04/SUJET-1-FRANCAISbef2025-.pdf", format: "pdf" },
  { year: "2025", subjects: ["Français"], kind: "Correction officielle", title: "Correction Français BEF 2025", url: "https://cripen.dj/wp-content/uploads/2026/04/FR-ELEMENTS-DU-CORRIGE-SUJET-1bef2025.pdf", format: "pdf" },
];

export const CRIPEN_ANNALES_PAGE = "https://cripen.dj/index.php/annales-bef/";
