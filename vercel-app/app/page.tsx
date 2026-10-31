"use client";

import { useState } from "react";
import { CRIPEN_ANNales, CRIPEN_ANNALES_PAGE } from "../annales";

type TesseractApi = {
  recognize: (image: Blob, language: string) => Promise<{ data: { text: string } }>;
};

declare global {
  interface Window {
    Tesseract?: TesseractApi;
  }
}

type Source = {
  filename: string;
  page: number;
  score: number;
  text: string;
  url?: string;
  sourceKind?: "guide" | "official_subject" | "official_correction";
  year?: string;
};
type Result = { answer: string; sources: Source[]; warning?: string; model?: string };

const subjects = ["Toutes les matières", "Mathématiques", "SVT", "Physique-Chimie", "Français", "Anglais", "Histoire-Géographie", "Informatique"];

async function loadTesseract(): Promise<TesseractApi> {
  if (window.Tesseract) return window.Tesseract;
  await new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Impossible de charger le moteur OCR. Vérifie ta connexion Internet puis réessaie."));
    document.head.appendChild(script);
  });
  if (!window.Tesseract) throw new Error("Le moteur OCR n'a pas pu être initialisé.");
  return window.Tesseract;
}

export default function Home() {
  const [question, setQuestion] = useState("");
  const [subject, setSubject] = useState(subjects[0]);
  const [examYear, setExamYear] = useState("2025");
  const [files, setFiles] = useState<FileList | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setResult(null);

    try {
      const selectedFiles = Array.from(files ?? []);
      if (selectedFiles.length > 8) throw new Error("Ajoute au maximum 8 fichiers à la fois.");

      const photos = selectedFiles.filter((file) => file.type.startsWith("image/"));
      const documents = selectedFiles.filter((file) => !file.type.startsWith("image/"));
      let recognizedExercise = "";

      if (photos.length) {
        const supported = ["image/jpeg", "image/png", "image/webp"];
        const unsupported = photos.find((file) => !supported.includes(file.type));
        if (unsupported) {
          throw new Error("Format photo non pris en charge : " + unsupported.type + ". Utilise JPG, PNG ou WEBP.");
        }

        const ocr = await loadTesseract();
        const recognized = await Promise.all(
          photos.map(async (photo) => (await ocr.recognize(photo, "fra+eng")).data.text.trim()),
        );
        recognizedExercise = recognized.filter(Boolean).join("\n\n");
        if (!recognizedExercise) {
          throw new Error("Aucun texte lisible n'a été reconnu. Essaie une photo plus nette et bien éclairée.");
        }
      }

      const data = new FormData();
      data.set("question", question);
      data.set("subject", subject);
      data.set("examYear", examYear);
      data.set("recognizedExercise", recognizedExercise);
      documents.forEach((file) => data.append("guides", file));

      const response = await fetch("/api/answer", { method: "POST", body: data });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || "Une erreur est survenue.");
      setResult(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inattendue.");
    } finally {
      setBusy(false);
    }
  }

  function chooseSubject(value: string) {
    setSubject(value);
    document.getElementById("subject")?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  return <main className="shell">
    <header className="hero">
      <div className="brandMark" aria-hidden="true">📚</div>
      <div className="brandText">
        <p className="eyebrow">TON ASSISTANT SCOLAIRE · 🇩🇯 DJIBOUTI</p>
        <h1>DjibotChat <span>9ème</span></h1>
        <p className="subtitle">En classe de 9ème — Djibouti</p>
        <p className="tagline">Mon assistant scolaire pour apprendre et réussir mon BEF !</p>
      </div>
    </header>

    <section className="welcome">
      <div className="welcomeIcon" aria-hidden="true">🌟</div>
      <div><h2>Bienvenue !</h2><p>Pose tes questions, comprends tes cours et entraîne-toi à ton rythme.</p></div>
    </section>

    <section className="featureGrid" aria-label="Aides scolaires">
      <button type="button" className="featureCard" onClick={() => chooseSubject("Toutes les matières")}><span className="featureIcon blue">💬</span><span className="featureTitle">Poser une question</span><span className="featureDesc">Obtenir une explication pas à pas</span></button>
      <button type="button" className="featureCard" onClick={() => chooseSubject("Mathématiques")}><span className="featureIcon green">✏️</span><span className="featureTitle">Corriger un exercice</span><span className="featureDesc">Comprendre comment trouver la réponse</span></button>
      <button type="button" className="featureCard" onClick={() => chooseSubject("Toutes les matières")}><span className="featureIcon gold">🏆</span><span className="featureTitle">Réussir mon BEF</span><span className="featureDesc">Réviser et s'entraîner pour l'examen</span></button>
    </section>

    <section className="befBanner"><div className="befBadge">🏆</div><div><h2>Objectif : réussir mon BEF !</h2><p>Révise régulièrement, entraîne-toi sur tes exercices et demande de l'aide quand une notion te semble difficile.</p></div></section>

    <section className="notice"><strong>Sources prioritaires :</strong> les corrections officielles CRIPEN BEF 2024–2025 sont recherchées avant les guides du professeur. L'application distingue toujours un sujet officiel d'une correction officielle. Vérifie les réponses et les pages indiquées.</section>

    <section className="panel annalesPanel">
      <div className="sectionHeading"><span>BEF</span><div><h2>Annales officielles du CRIPEN</h2><p>Sujets et corrections des sessions 2024 et 2025.</p></div></div>
      <p className="hint">Les documents restent hébergés sur le site officiel du CRIPEN. Choisis une matière et une session dans le formulaire pour lancer la recherche dans leur contenu.</p>
      <div className="annalesList">
        {(["2025", "2024"] as const).map((year) => <div className="annaleYear" key={year}>
          <h3>BEF {year}</h3>
          <ul>{CRIPEN_ANNales.filter((item) => item.year === year).map((item) => <li key={item.url}><a href={item.url} target="_blank" rel="noreferrer">{item.subjects.join(" / ")} — {item.kind} : {item.title}</a></li>)}</ul>
        </div>)}
      </div>
      <p className="annalesOfficialLink"><a href={CRIPEN_ANNALES_PAGE} target="_blank" rel="noreferrer">Ouvrir toutes les annales sur le site officiel du CRIPEN ↗</a></p>
    </section>

    <form className="panel" onSubmit={submit}>
      <div className="sectionHeading"><span>01</span><div><h2>On travaille ensemble</h2><p>Choisis la matière et la session, prends une photo ou joins un document.</p></div></div>
      <label htmlFor="subject">Matière scolaire</label>
      <select id="subject" value={subject} onChange={(event) => setSubject(event.target.value)}>{subjects.map((value) => <option key={value}>{value}</option>)}</select>
      <label htmlFor="examYear">Session des annales du BEF</label>
      <select id="examYear" value={examYear} onChange={(event) => setExamYear(event.target.value)}>
        <option value="2025">BEF 2025</option>
        <option value="2024">BEF 2024</option>
        <option value="Toutes les sessions">Toutes les sessions (2024–2025)</option>
      </select>
      <p className="hint">Pour rechercher dans les annales du CRIPEN, sélectionne une matière précise : Mathématiques, SVT, Physique-Chimie ou Français.</p>
      <label htmlFor="guides">📸 Photo de l'exercice, guide PDF ou document Word</label>
      <input id="guides" type="file" accept="image/jpeg,image/png,image/webp,application/pdf,.pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" multiple onChange={(event) => setFiles(event.target.files)} />
      <p className="hint">Sur Android, choisis une photo dans la Galerie ou prends une photo avec l'appareil. L'OCR est effectué dans le navigateur : seul le texte reconnu est transmis au service de réponse, pas la photo. Relis le texte OCR, surtout les nombres et les formules. Formats : JPG, PNG, WEBP, PDF, DOC ou DOCX ; 8 Mo maximum par fichier.</p>
      {files && files.length > 0 && <p className="hint">📎 {files.length} fichier(s) sélectionné(s).</p>}
      <label htmlFor="question">Consigne (facultatif si tu joins une photo)</label>
      <textarea id="question" rows={4} value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Ex. : Recherche le corrigé officiel du BEF 2025 en mathématiques et explique chaque étape…" />
      <button className="submitButton" disabled={busy || (!question.trim() && !(files && files.length > 0))}>{busy ? "OCR et recherche dans les guides et annales…" : "📷 Lire, rechercher et corriger"}</button>
    </form>
    {error && <section className="error" role="alert">{error}</section>}
    {result && <section className="panel answer">
      <h2>Corrigé et explication</h2>
      {result.warning && <p className="hint">{result.warning}</p>}
      <div className="answerText">{result.answer}</div>
      {result.model && <p className="hint">Modèle : {result.model}</p>}
      <h3>Sources retrouvées</h3>
      {result.sources.length ? result.sources.map((source, index) => {
        const label = source.sourceKind === "official_correction"
          ? "Correction officielle CRIPEN"
          : source.sourceKind === "official_subject"
            ? "Sujet officiel CRIPEN (énoncé)"
            : "Guide du professeur / document joint";
        return <details key={source.filename + "-" + source.page + "-" + index}>
          <summary>{label} · {source.filename} · page/segment {source.page}</summary>
          {source.url && <p><a href={source.url} target="_blank" rel="noreferrer">Ouvrir le document source ↗</a></p>}
          <p>{source.text}</p>
        </details>;
      }) : <p>Aucun passage suffisamment pertinent n'a été trouvé dans les guides ou annales sélectionnés.</p>}
    </section>}
    <footer><strong>DjibotChat 9ème · Djibouti 🇩🇯</strong><br />Apprendre, progresser et préparer mon BEF. Les réponses de l'IA doivent être vérifiées.</footer>
  </main>;
}
