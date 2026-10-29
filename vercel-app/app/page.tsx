"use client";

import { useState } from "react";
import { CRIPEN_ANNales, CRIPEN_ANNALES_PAGE } from "../annales";

type Source = { filename: string; page: number; score: number; text: string; url?: string };
type Result = { answer: string; sources: Source[]; warning?: string };

const subjects = ["Toutes les matières", "Mathématiques", "SVT", "Physique-Chimie", "Français", "Anglais", "Histoire-Géographie", "Informatique"];

export default function Home() {
  const [question, setQuestion] = useState("");
  const [subject, setSubject] = useState(subjects[0]);
  const [examYear, setExamYear] = useState("2025");
  const [files, setFiles] = useState<FileList | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setBusy(true); setError(""); setResult(null);
    try {
      const data = new FormData();
      data.set("question", question);
      data.set("subject", subject);
      data.set("examYear", examYear);
      Array.from(files ?? []).forEach(file => data.append("guides", file));
      const response = await fetch("/api/answer", { method: "POST", body: data });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || "Une erreur est survenue.");
      setResult(json);
    } catch (err) { setError(err instanceof Error ? err.message : "Erreur inattendue."); }
    finally { setBusy(false); }
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

    <section className="notice"><strong>Guides du professeur connectés :</strong> les fichiers math9eme.pdf, svt.pdf, pc(1).pdf, fr.pdf et infos.pdf du dépôt GitHub sont recherchés automatiquement. Les annales officielles CRIPEN 2024–2025 peuvent aussi être recherchées par matière et session. Vérifie toujours les réponses avec ton professeur.</section>

    <section className="panel annalesPanel">
      <div className="sectionHeading"><span>BEF</span><div><h2>Annales officielles du CRIPEN</h2><p>Sujets et corrections des sessions 2024 et 2025.</p></div></div>
      <p className="hint">Les documents ci-dessous restent hébergés sur le site officiel du CRIPEN. Pour que le chatbot recherche automatiquement dans leur contenu, choisis une matière et une session dans le formulaire puis pose ta question.</p>
      <div className="annalesList">
        {(["2025", "2024"] as const).map(year => <div className="annaleYear" key={year}>
          <h3>BEF {year}</h3>
          <ul>{CRIPEN_ANNales.filter(item => item.year === year).map(item => <li key={item.url}><a href={item.url} target="_blank" rel="noreferrer">{item.subjects.join(" / ")} — {item.kind} : {item.title}</a></li>)}</ul>
        </div>)}
      </div>
      <p className="annalesOfficialLink"><a href={CRIPEN_ANNALES_PAGE} target="_blank" rel="noreferrer">Ouvrir toutes les annales sur le site officiel du CRIPEN ↗</a></p>
    </section>

    <form className="panel" onSubmit={submit}>
      <div className="sectionHeading"><span>01</span><div><h2>On travaille ensemble</h2><p>Choisis la matière et la session, prends une photo ou joins un document.</p></div></div>
      <label htmlFor="subject">Matière scolaire</label>
      <select id="subject" value={subject} onChange={e => setSubject(e.target.value)}>{subjects.map(s => <option key={s}>{s}</option>)}</select>
      <label htmlFor="examYear">Session des annales du BEF</label>
      <select id="examYear" value={examYear} onChange={e => setExamYear(e.target.value)}>
        <option value="2025">BEF 2025</option>
        <option value="2024">BEF 2024</option>
        <option value="Toutes les sessions">Toutes les sessions (2024–2025)</option>
      </select>
      <p className="hint">Pour rechercher dans les annales du CRIPEN, sélectionne une matière précise (Mathématiques, SVT, Physique-Chimie ou Français). « Toutes les matières » utilise les guides du professeur et ne lance pas le chargement des annales externes.</p>
      <label htmlFor="guides">📸 Photo, guide PDF ou document Word</label>
      <input id="guides" type="file" accept="image/*,application/pdf,.pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" multiple onChange={e => setFiles(e.target.files)} />
      <p className="hint">Sur Android, appuie sur « Choisir un fichier », puis sélectionne une photo déjà présente dans la Galerie/Photos, prends une nouvelle photo si cette option est proposée, ou joins un PDF/Word. Formats acceptés : JPG, PNG, WEBP, PDF, DOC ou DOCX ; 8 Mo maximum par fichier.</p>
      {files && files.length > 0 && <p className="hint">📎 {files.length} fichier(s) sélectionné(s).</p>}
      <label htmlFor="question">Consigne (facultatif si tu joins une photo)</label>
      <textarea id="question" rows={4} value={question} onChange={e => setQuestion(e.target.value)} placeholder="Ex. : Recherche le corrigé officiel du BEF 2025 en mathématiques et explique chaque étape…" />
      <button className="submitButton" disabled={busy || (!question.trim() && !(files && files.length > 0))}>{busy ? "Recherche dans les guides et les annales du CRIPEN…" : "📷 Lire, rechercher et corriger"}</button>
    </form>
    {error && <section className="error" role="alert">{error}</section>}
    {result && <section className="panel answer"><h2>Corrigé et explication</h2>{result.warning && <p className="hint">{result.warning}</p>}<div className="answerText">{result.answer}</div><h3>Sources retrouvées</h3>{result.sources.length ? result.sources.map((s,i)=><details key={`${s.filename}-${s.page}-${i}`}><summary>{s.filename} · page/segment {s.page} · pertinence {s.score.toFixed(2)}</summary>{s.url && <p><a href={s.url} target="_blank" rel="noreferrer">Ouvrir le document source officiel ↗</a></p>}<p>{s.text}</p></details>) : <p>Aucun passage suffisamment pertinent n'a été trouvé dans les guides ou annales sélectionnés.</p>}</section>}
    <footer><strong>DjibotChat 9ème · Djibouti 🇩🇯</strong><br />Apprendre, progresser et préparer mon BEF. Les réponses de l'IA doivent être vérifiées.</footer>
  </main>;
}
