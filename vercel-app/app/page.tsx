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

  return <main className="shell">
    <header className="hero"><div className="book">📚</div><div><p className="eyebrow">ASSISTANT SCOLAIRE · DJIBOUTI</p><h1>DjibotChat <span>9e année</span></h1><p className="subtitle">Comprendre les exercices avec l’aide des guides du professeur.</p></div></header>
    <section className="notice"><strong>À savoir :</strong> ajoute les guides PDF pour que les réponses puissent s’appuyer sur leurs extraits. Vérifie toujours les réponses avec ton professeur.</section>
    <form className="panel" onSubmit={submit}>
      <label htmlFor="subject">1. Matière</label><select id="subject" value={subject} onChange={e => setSubject(e.target.value)}>{subjects.map(s => <option key={s}>{s}</option>)}</select>
      <label htmlFor="guides">2. Guides du professeur (PDF)</label><input id="guides" type="file" accept="application/pdf,.pdf" multiple onChange={e => setFiles(e.target.files)} />
      <p className="hint">Tu peux sélectionner plusieurs fichiers PDF. Les fichiers sont traités pour cette demande et ne sont pas enregistrés dans une bibliothèque permanente.</p>
      <label htmlFor="question">3. Énoncé de l’exercice</label><textarea id="question" required minLength={2} rows={6} value={question} onChange={e => setQuestion(e.target.value)} placeholder="Écris l’énoncé, les données et les questions ici…" />
      <button disabled={busy || !question.trim()}>{busy ? "Recherche et préparation du corrigé…" : "Rechercher et expliquer l’exercice"}</button>
    </form>
    {error && <section className="error" role="alert">{error}</section>}
    {result && <section className="panel answer"><h2>Corrigé et explication</h2><div className="answerText">{result.answer}</div><h3>Sources retrouvées</h3>{result.sources.length ? result.sources.map((s,i)=><details key={`${s.filename}-${s.page}-${i}`}><summary>{s.filename} · page {s.page} · pertinence {s.score.toFixed(2)}</summary><p>{s.text}</p></details>) : <p>Aucun passage suffisamment pertinent n’a été trouvé dans les guides fournis.</p>}</section>}
    <footer>Prototype éducatif · Les sources doivent être vérifiées. La clé Gemini reste côté serveur.</footer>
  </main>;
}
