"use client";

import { useState } from "react";

type Source = { filename: string; page: number; score: number; text: string };
type Result = { answer: string; sources: Source[]; warning?: string };

const subjects = ["Toutes les matières", "Mathématiques", "SVT", "Physique-Chimie", "Français", "Anglais", "Histoire-Géographie", "Informatique"];

export default function Home() {
  const [question, setQuestion] = useState("");
  const [subject, setSubject] = useState(subjects[0]);
  const [files, setFiles] = useState<FileList | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setBusy(true); setError(""); setResult(null);
    try {
      const data = new FormData(); data.set("question", question); data.set("subject", subject);
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

    <section className="notice"><strong>Conseil :</strong> ajoute les guides PDF de ton professeur pour que les réponses puissent s'appuyer sur leur contenu. Vérifie toujours les réponses avec ton professeur.</section>

    <form className="panel" onSubmit={submit}>
      <div className="sectionHeading"><span>01</span><div><h2>On travaille ensemble</h2><p>Choisis une matière, prends une photo ou joins un document.</p></div></div>
      <label htmlFor="subject">Matière scolaire</label>
      <select id="subject" value={subject} onChange={e => setSubject(e.target.value)}>{subjects.map(s => <option key={s}>{s}</option>)}</select>
      <label htmlFor="guides">📸 Photo de l’exercice ou guide du professeur</label>
      <input id="guides" type="file" accept="image/*,application/pdf,.pdf" capture="environment" multiple onChange={e => setFiles(e.target.files)} />
      <p className="hint">Sur téléphone, choisis l’appareil photo pour photographier la page. Tu peux aussi sélectionner une photo déjà prise ou joindre un guide PDF du professeur (8 Mo maximum par fichier).</p>
      {files && files.length > 0 && <p className="hint">📎 {files.length} fichier(s) sélectionné(s).</p>}
      <label htmlFor="question">Consigne (facultatif si tu joins une photo)</label>
      <textarea id="question" rows={4} value={question} onChange={e => setQuestion(e.target.value)} placeholder="Ex. : Corrige cet exercice étape par étape et cherche d’abord dans les guides du professeur…" />
      <button className="submitButton" disabled={busy || (!question.trim() && !(files && files.length > 0))}>{busy ? "Lecture de l’exercice et recherche du corrigé…" : "📷 Lire la photo et corriger l’exercice"}</button>
    </form>
    {error && <section className="error" role="alert">{error}</section>}
    {result && <section className="panel answer"><h2>Corrigé et explication</h2>{result.warning && <p className="hint">{result.warning}</p>}<div className="answerText">{result.answer}</div><h3>Sources retrouvées</h3>{result.sources.length ? result.sources.map((s,i)=><details key={`${s.filename}-${s.page}-${i}`}><summary>{s.filename} · page {s.page} · pertinence {s.score.toFixed(2)}</summary><p>{s.text}</p></details>) : <p>Aucun passage suffisamment pertinent n'a été trouvé dans les guides fournis.</p>}</section>}
    <footer><strong>DjibotChat 9ème · Djibouti 🇩🇯</strong><br />Apprendre, progresser et préparer mon BEF. Les réponses de l'IA doivent être vérifiées.</footer>
  </main>;
}
