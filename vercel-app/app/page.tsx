"use client";

import { useRef, useState } from "react";
import { CRIPEN_ANNales, CRIPEN_ANNALES_PAGE } from "../annales";
import { PEDAGOGY_MODES, type PedagogyMode } from "../lib/pedagogy";

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
type Result = { answer: string; sources: Source[]; warning?: string; model?: string; correctionStatus?: "official_candidate" | "ai_generated_unverified" };

const subjects = ["Toutes les matières", "Mathématiques", "SVT", "Physique-Chimie", "Français", "Arabe", "Anglais", "Histoire-Géographie", "Informatique"];

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
  const [mode, setMode] = useState<PedagogyMode>("corrige");
  const [assessmentPeriod, setAssessmentPeriod] = useState("Deux premiers mois");
  const [assessmentChapters, setAssessmentChapters] = useState("");
  const [assessmentCustomPeriod, setAssessmentCustomPeriod] = useState("");
  const [assessmentDuration, setAssessmentDuration] = useState("1 heure");
  const [assessmentPoints, setAssessmentPoints] = useState("20");
  const [studentAnswer, setStudentAnswer] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setResult(null);

    try {
      const selectedFiles = files;
      if (selectedFiles.length > 8) throw new Error("Ajoute au maximum 8 fichiers à la fois, dont 5 photos maximum.");
      const photoCount = selectedFiles.filter((file) => file.type.startsWith("image/") || /\.(jpe?g|png|webp)$/i.test(file.name)).length;
      if (photoCount > 5) throw new Error("Tu peux ajouter jusqu’à 5 photos par envoi.");
      const allowedExtensions = /\.(jpe?g|png|webp|pdf|docx?)$/i;
      const invalidFile = selectedFiles.find((file) => !allowedExtensions.test(file.name));
      if (invalidFile) {
        throw new Error("Format non pris en charge : " + invalidFile.name + ". Choisis une photo JPG/PNG/WEBP, un PDF ou un document Word DOC/DOCX.");
      }
      const oversizedFile = selectedFiles.find((file) => file.size > 8 * 1024 * 1024);
      if (oversizedFile) throw new Error("Le fichier " + oversizedFile.name + " dépasse 8 Mo.");

      const photos = selectedFiles.filter((file) => file.type.startsWith("image/") || /\.(jpe?g|png|webp)$/i.test(file.name));
      const documents = selectedFiles.filter((file) => !(file.type.startsWith("image/") || /\.(jpe?g|png|webp)$/i.test(file.name)));
      let recognizedExercise = "";

      if (photos.length) {
        const supported = ["image/jpeg", "image/png", "image/webp"];
        const unsupported = photos.find((file) => file.type && !supported.includes(file.type));
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
      data.set("mode", mode);
      data.set("studentAnswer", studentAnswer);
      data.set("assessmentPeriod", assessmentPeriod);
      data.set("assessmentChapters", assessmentChapters);
      data.set("assessmentCustomPeriod", assessmentCustomPeriod);
      data.set("assessmentDuration", assessmentDuration);
      data.set("assessmentPoints", assessmentPoints);
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

  function handleFilesSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const incoming = Array.from(event.currentTarget.files ?? []);
    // Reset the native picker so the same file can be selected again if needed.
    event.currentTarget.value = "";
    if (!incoming.length) return;

    const combined = [...files];
    for (const file of incoming) {
      const duplicate = combined.some((item) => item.name === file.name && item.size === file.size && item.lastModified === file.lastModified);
      if (!duplicate) combined.push(file);
    }
    const photoCount = combined.filter((file) => file.type.startsWith("image/") || /\.(jpe?g|png|webp)$/i.test(file.name)).length;
    if (photoCount > 5) {
      setError("Maximum 5 photos par envoi. Les photos déjà sélectionnées sont conservées.");
      return;
    }
    if (combined.length > 8) {
      setError("Maximum 8 fichiers au total par envoi. Les fichiers déjà sélectionnés sont conservés.");
      return;
    }
    setError("");
    setFiles(combined);
  }

  function clearFiles() {
    setFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setError("");
  }

  function downloadWord() {
    if (!result) return;
    const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (character) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    })[character] ?? character);
    const sourceList = result.sources.map((source) =>
      "<li><strong>" + escapeHtml(source.filename) + "</strong> — page/segment " + source.page + "</li>",
    ).join("");
    const documentHtml = "<!doctype html><html><head><meta charset='utf-8'><title>Devoir commun BEF</title></head><body>" +
      "<h1>DjibotChat 9ème — Devoir commun type BEF</h1>" +
      "<p><strong>Matière :</strong> " + escapeHtml(subject) + "</p>" +
      "<p><strong>Période :</strong> " + escapeHtml(assessmentPeriod === "Période personnalisée" ? assessmentCustomPeriod : assessmentPeriod) + "</p>" +
      "<p><strong>Chapitres :</strong> " + escapeHtml(assessmentChapters) + "</p>" +
      "<hr><h2>Sujet et corrigé</h2><pre style='white-space:pre-wrap;font-family:Arial,sans-serif'>" + escapeHtml(result.answer) + "</pre>" +
      (sourceList ? "<h2>Sources consultées</h2><ul>" + sourceList + "</ul>" : "") +
      (result.warning ? "<p><strong>Note :</strong> " + escapeHtml(result.warning) + "</p>" : "") +
      "</body></html>";
    const blob = new Blob(["\ufeff", documentHtml], { type: "application/msword;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "devoir-commun-bef-" + subject.toLowerCase().replace(/[^a-z0-9]+/g, "-") + ".doc";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
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
      <p className="hint">Choisis la matière réellement étudiée. Les sources CRIPEN et les guides disponibles sont consultés lorsqu’ils existent. Si aucun document pertinent n’est retrouvé, le sujet généré reste une proposition non officielle.</p>
      <label htmlFor="examYear">Session des annales du BEF</label>
      <select id="examYear" value={examYear} onChange={(event) => setExamYear(event.target.value)}>
        <option value="2025">BEF 2025</option>
        <option value="2024">BEF 2024</option>
        <option value="Toutes les sessions">Toutes les sessions (2024–2025)</option>
      </select>
      <p className="hint">Pour rechercher dans les annales du CRIPEN, sélectionne une matière précise : Mathématiques, SVT, Physique-Chimie ou Français.</p>
      <label htmlFor="mode">Mode de travail</label>
      <select id="mode" value={mode} onChange={(event) => setMode(event.target.value as PedagogyMode)}>{Object.entries(PEDAGOGY_MODES).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
      {mode === "devoir" && <section className="assessmentFields" aria-label="Paramètres du devoir commun BEF">
        <h3>Préparer le devoir commun</h3>
        <p className="hint">Le devoir sera construit à partir des chapitres réellement étudiés. Il ne sera pas présenté comme un sujet officiel du CRIPEN.</p>
        <label htmlFor="assessmentPeriod">Période de révision</label>
        <select id="assessmentPeriod" value={assessmentPeriod} onChange={(event) => setAssessmentPeriod(event.target.value)}>
          <option>Premier mois</option><option>Deux premiers mois</option><option>Trois premiers mois</option><option>Trimestre</option><option>Période personnalisée</option>
        </select>
        {assessmentPeriod === "Période personnalisée" && <><label htmlFor="assessmentCustomPeriod">Précise la période</label><input id="assessmentCustomPeriod" value={assessmentCustomPeriod} onChange={(event) => setAssessmentCustomPeriod(event.target.value)} placeholder="Ex. : du 1er au 15 octobre" /></>}
        <label htmlFor="assessmentChapters">Chapitres réellement étudiés</label>
        <textarea id="assessmentChapters" rows={4} value={assessmentChapters} onChange={(event) => setAssessmentChapters(event.target.value)} placeholder="Écris les titres des chapitres ou colle la liste du cahier de cours…" />
        <label htmlFor="assessmentDuration">Durée du devoir</label>
        <select id="assessmentDuration" value={assessmentDuration} onChange={(event) => setAssessmentDuration(event.target.value)}><option>1 heure</option><option>1 heure 30</option><option>2 heures</option></select>
        <label htmlFor="assessmentPoints">Note totale</label>
        <select id="assessmentPoints" value={assessmentPoints} onChange={(event) => setAssessmentPoints(event.target.value)}><option value="20">Sur 20</option><option value="40">Sur 40</option></select>
      </section>}
      {mode === "erreur" && <><label htmlFor="studentAnswer">Ta réponse à analyser</label><textarea id="studentAnswer" rows={3} value={studentAnswer} onChange={(event) => setStudentAnswer(event.target.value)} placeholder="Écris ta réponse pour analyser ton raisonnement…" /></>}
      <label htmlFor="guides">📎 Ajouter une photo ou un document</label>
      <input ref={fileInputRef} id="guides" className="fileInputHidden" type="file" accept=".jpg,.jpeg,.png,.webp,.pdf,.doc,.docx,image/jpeg,image/png,image/webp,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" multiple onChange={handleFilesSelected} />
      <label className="filePickerButton" htmlFor="guides">📁 Choisir des fichiers — Photos · PDF · Word</label>
      <p className="hint">Formats acceptés : JPG, PNG, WEBP, PDF, DOC et DOCX. Tu peux sélectionner plusieurs photos en une seule fois ou les ajouter en plusieurs sélections : elles seront cumulées. Maximum 5 photos et 8 fichiers au total, de 8 Mo chacun. Sur Android, utilise Galerie/Photos pour les images ou Fichiers/Parcourir pour les PDF et Word. Les photos sont lues par OCR.</p>
      {files.length > 0 && <div className="selectedFiles" aria-live="polite"><strong>Fichiers sélectionnés ({files.length}) — {files.filter((file) => file.type.startsWith("image/") || /\.(jpe?g|png|webp)$/i.test(file.name)).length} photo(s) :</strong><ul>{files.map((file, index) => <li key={file.name + file.size + file.lastModified + index}>{file.name}</li>)}</ul><button type="button" className="filePickerButton" onClick={clearFiles}>✕ Effacer la sélection</button></div>}
      <label htmlFor="question">Consigne (facultatif si tu joins une photo)</label>
      <textarea id="question" rows={4} value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Ex. : Recherche le corrigé officiel du BEF 2025 en mathématiques et explique chaque étape…" />
      <button className="submitButton" disabled={busy || (mode === "devoir" ? !assessmentChapters.trim() : (!question.trim() && files.length === 0))}>{busy ? "Préparation et recherche dans les ressources…" : mode === "devoir" ? "🏆 Générer le sujet et le corrigé BEF" : "📷 Lire, rechercher et corriger"}</button>
    </form>
    {error && <section className="error" role="alert">{error}</section>}
    {result && <section className="panel answer">
      <h2>Corrigé et explication</h2>
      <button type="button" className="wordExportButton" onClick={downloadWord}>⬇️ Télécharger le sujet et le corrigé en Word</button>
      {result.correctionStatus === "ai_generated_unverified" && <p className="hint"><strong>Résolution IA — non officielle :</strong> aucun corrigé CRIPEN correspondant n’a été retrouvé. Vérifie le raisonnement avec ton professeur ou ton manuel.</p>}
      {result.correctionStatus === "official_candidate" && <p className="hint"><strong>Source officielle candidate :</strong> un document CRIPEN de type correction figure parmi les résultats. Vérifie sa correspondance avec l’énoncé avant de considérer la correction comme officielle.</p>}
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
