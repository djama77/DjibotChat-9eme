import { NextResponse } from "next/server";
import pdf from "pdf-parse";
import mammoth from "mammoth";
import { CRIPEN_ANNales, type AnnaleResource } from "../../../annales";

export const runtime = "nodejs";
export const maxDuration = 60;

type DocChunk = { filename: string; page: number; text: string; url?: string };

function tokens(text: string): string[] {
  const stop = new Set("le la les un une des du de d et ou a au aux en dans pour par sur avec est sont qui que quoi comment pourquoi exercice question calculer déterminer montrer donner soit ce cette ces leur on nous vous ils elles il elle être avoir faire plus moins comme mais donc quel quelle quels quelles".split(" "));
  return (text.toLocaleLowerCase("fr").match(/[a-zà-ÿ0-9]+/gi) ?? []).filter(t => t.length > 1 && !stop.has(t));
}
function chunks(text: string, filename: string, url?: string): DocChunk[] {
  const pages = text.split("\f");
  const out: DocChunk[] = [];
  pages.forEach((page, i) => {
    const clean = page.replace(/\s+/g, " ").trim();
    for (let start = 0; start < clean.length; start += 850) {
      const piece = clean.slice(start, start + 1000).trim();
      if (piece) out.push({ filename, page: i + 1, text: piece, ...(url ? { url } : {}) });
    }
  });
  return out;
}

const REPOSITORY_GUIDES = [
  { filename: "math9eme.pdf", subjects: ["Mathématiques"], url: "https://raw.githubusercontent.com/djama77/DjibotChat-9eme/vercel-deploy/math9eme.pdf" },
  { filename: "svt.pdf", subjects: ["SVT"], url: "https://raw.githubusercontent.com/djama77/DjibotChat-9eme/vercel-deploy/svt.pdf" },
  { filename: "pc(1).pdf", subjects: ["Physique-Chimie"], url: "https://raw.githubusercontent.com/djama77/DjibotChat-9eme/vercel-deploy/pc%281%29.pdf" },
  { filename: "fr.pdf", subjects: ["Français"], url: "https://raw.githubusercontent.com/djama77/DjibotChat-9eme/vercel-deploy/fr.pdf" },
  { filename: "infos.pdf", subjects: ["Informatique"], url: "https://raw.githubusercontent.com/djama77/DjibotChat-9eme/vercel-deploy/infos.pdf" },
];

const guideCache = new Map<string, Promise<DocChunk[]>>();
const annaleCache = new Map<string, Promise<DocChunk[]>>();

async function loadRepositoryGuide(guide: typeof REPOSITORY_GUIDES[number]): Promise<DocChunk[]> {
  let cached = guideCache.get(guide.filename);
  if (!cached) {
    cached = (async () => {
      const response = await fetch(guide.url, { signal: AbortSignal.timeout(20000) });
      if (!response.ok) throw new Error("Impossible de charger le guide " + guide.filename + " (HTTP " + response.status + ").");
      const parsed = await pdf(Buffer.from(await response.arrayBuffer()));
      return chunks(parsed.text, guide.filename, guide.url);
    })();
    guideCache.set(guide.filename, cached);
    cached.catch(() => guideCache.delete(guide.filename));
  }
  return cached;
}

async function extractDocument(buffer: Buffer, format: "pdf" | "doc" | "docx"): Promise<string> {
  if (format === "pdf") {
    const parsed = await pdf(buffer);
    return parsed.text;
  }
  if (format === "docx") {
    const parsed = await mammoth.extractRawText({ buffer });
    return parsed.value;
  }
  // word-extractor supports legacy Microsoft Word .doc files.
  const WordExtractor = require("word-extractor") as new () => {
    extract(input: Buffer): Promise<{ getBody(): string }>;
  };
  const extractor = new WordExtractor();
  const document = await extractor.extract(buffer);
  return document.getBody();
}

async function loadAnnale(resource: AnnaleResource): Promise<DocChunk[]> {
  const cacheKey = resource.url;
  let cached = annaleCache.get(cacheKey);
  if (!cached) {
    cached = (async () => {
      const response = await fetch(resource.url, { signal: AbortSignal.timeout(16000) });
      if (!response.ok) throw new Error("Le document CRIPEN « " + resource.title + " » est indisponible (HTTP " + response.status + ").");
      const buffer = Buffer.from(await response.arrayBuffer());
      const text = await extractDocument(buffer, resource.format);
      if (!text.trim()) throw new Error("Aucun texte extractible dans « " + resource.title + " ».");
      return chunks(text, resource.title, resource.url);
    })();
    annaleCache.set(cacheKey, cached);
    cached.catch(() => annaleCache.delete(cacheKey));
  }
  return cached;
}

export async function POST(request: Request) {
  try {
    const key = process.env.GEMINI_API_KEY;
    if (!key) return NextResponse.json({ error: "La clé GEMINI_API_KEY n’est pas encore configurée dans les variables d’environnement Vercel." }, { status: 500 });

    const form = await request.formData();
    const question = String(form.get("question") ?? "").trim();
    const subject = String(form.get("subject") ?? "Toutes les matières");
    const examYear = String(form.get("examYear") ?? "2025");
    const uploaded = form.getAll("guides").filter((v): v is File => v instanceof File && v.size > 0);

    if (!question && !uploaded.some(f => f.type.startsWith("image/"))) return NextResponse.json({ error: "Ajoute une photo de l’exercice ou écris ta question." }, { status: 400 });
    if (uploaded.length > 8) return NextResponse.json({ error: "Ajoute au maximum 8 photos ou guides à la fois." }, { status: 400 });

    const docs: DocChunk[] = [];
    const selectedGuides = subject === "Toutes les matières" ? REPOSITORY_GUIDES : REPOSITORY_GUIDES.filter(guide => guide.subjects.includes(subject));
    const guideResults = await Promise.allSettled(selectedGuides.map(loadRepositoryGuide));
    for (const result of guideResults) if (result.status === "fulfilled") docs.push(...result.value);
    const guideLoadWarnings = guideResults.filter((result): result is PromiseRejectedResult => result.status === "rejected")
      .map(result => result.reason instanceof Error ? result.reason.message : "Un guide du dépôt GitHub n’a pas pu être chargé.");

    // To keep requests fast and focused, official CRIPEN annales are loaded for a selected subject and session.
    const selectedAnnales = subject !== "Toutes les matières"
      ? CRIPEN_ANNales.filter(item => item.subject === subject && (examYear === "Toutes les sessions" || item.year === examYear))
      : [];
    const annaleResults = await Promise.allSettled(selectedAnnales.map(loadAnnale));
    for (const result of annaleResults) if (result.status === "fulfilled") docs.push(...result.value);
    const annaleLoadWarnings = annaleResults.filter((result): result is PromiseRejectedResult => result.status === "rejected")
      .map(result => result.reason instanceof Error ? result.reason.message : "Une annale du CRIPEN n’a pas pu être chargée.");

    const imageParts: Array<{ inline_data: { mime_type: string; data: string } }> = [];
    for (const file of uploaded) {
      if (file.size > 8 * 1024 * 1024) return NextResponse.json({ error: `Le fichier ${file.name} dépasse 8 Mo.` }, { status: 413 });
      const name = file.name.toLowerCase();
      if (file.type === "application/pdf" || name.endsWith(".pdf")) {
        const parsedText = await extractDocument(Buffer.from(await file.arrayBuffer()), "pdf");
        docs.push(...chunks(parsedText, file.name));
      } else if (name.endsWith(".docx") || file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
        const parsedText = await extractDocument(Buffer.from(await file.arrayBuffer()), "docx");
        docs.push(...chunks(parsedText, file.name));
      } else if (name.endsWith(".doc") || file.type === "application/msword") {
        const parsedText = await extractDocument(Buffer.from(await file.arrayBuffer()), "doc");
        docs.push(...chunks(parsedText, file.name));
      } else if (file.type.startsWith("image/")) {
        const supported = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];
        if (!supported.includes(file.type)) return NextResponse.json({ error: `Le format photo ${file.type} n’est pas pris en charge. Utilise JPG, PNG ou WEBP.` }, { status: 400 });
        imageParts.push({ inline_data: { mime_type: file.type, data: Buffer.from(await file.arrayBuffer()).toString("base64") } });
      } else {
        return NextResponse.json({ error: `Format non pris en charge pour ${file.name}. Utilise une photo, un PDF ou un document Word (.doc/.docx).` }, { status: 400 });
      }
    }

    const effectiveQuestion = question || "Lis attentivement la photo de l’exercice, identifie la matière et toutes les questions, puis donne un corrigé détaillé adapté à un élève de 9ème à Djibouti.";
    let recognizedExercise = "";
    if (imageParts.length) {
      const ocrResponse = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + encodeURIComponent(key), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: "Transcris fidèlement le texte de cet exercice photographié, y compris nombres, signes, formules et questions. Ne résous pas l’exercice. Si un élément est illisible, indique [illisible]." }, ...imageParts] }], generationConfig: { temperature: 0 } }),
        signal: AbortSignal.timeout(20000)
      });
      if (ocrResponse.ok) {
        const ocrPayload = await ocrResponse.json();
        recognizedExercise = (ocrPayload?.candidates?.[0]?.content?.parts ?? []).map((part: { text?: string }) => part.text ?? "").join("\n");
      }
    }

    const searchText = question + " " + recognizedExercise + " " + subject + " BEF " + examYear;
    const qTokens = new Set(tokens(searchText));
    const scored = docs.map(d => {
      const dt = tokens(d.text);
      const unique = new Set(dt);
      let common = 0;
      qTokens.forEach(t => { if (unique.has(t)) common++; });
      let score = common / Math.max(1, qTokens.size);
      const filename = d.filename.toLocaleLowerCase("fr");
      const terms: Record<string, string[]> = {
        "Mathématiques": ["math", "mathématique"],
        "SVT": ["svt", "science"],
        "Physique-Chimie": ["physique", "chimie", "pc", "science"],
        "Français": ["français", "francais", "sujet 1fr"],
        "Anglais": ["anglais", "english"],
        "Histoire-Géographie": ["histoire", "géo", "geo"],
        "Informatique": ["info"]
      };
      if (subject !== "Toutes les matières" && (terms[subject] ?? []).some(t => filename.includes(t))) score += 0.2;
      if (examYear !== "Toutes les sessions" && filename.includes(examYear)) score += 0.1;
      return { ...d, score };
    }).filter(d => d.score >= 0.04).sort((a, b) => b.score - a.score).slice(0, 8);

    const context = scored.length
      ? scored.map(s => `[Source : ${s.filename}, page/segment ${s.page}${s.url ? ", document officiel : " + s.url : ""}]\n${s.text}`).join("\n\n")
      : "[Aucun extrait suffisamment pertinent retrouvé dans les guides ou les annales sélectionnées.]";

    const prompt = `Tu es un assistant pédagogique pour les élèves de 9e année à Djibouti. Réponds en français simple, étape par étape. Priorité : cherche d'abord dans les annales BEF du CRIPEN de l'année et de la matière choisies, puis dans les guides PDF joints ou du dépôt. Distingue explicitement le sujet officiel, la correction officielle et ton explication pédagogique. Ne dis jamais qu'une réponse est une correction officielle si elle n'est pas clairement issue du document de correction correspondant. Si un corrigé officiel correspondant est présent, explique-le en détail et cite son titre. Si aucun corrigé officiel correspondant n'est retrouvé, écris « CORRECTION OFFICIELLE NON RETROUVÉE » puis propose une résolution indépendante en précisant qu'elle n'a pas été vérifiée par le CRIPEN. Si la photo est floue ou incomplète, demande une nouvelle photo plutôt que d'inventer. Montre les étapes de calcul et explique les notions au niveau 9ème.\nMatière choisie : ${subject}\nSession BEF choisie : ${examYear}\nConsigne de l’élève : ${effectiveQuestion}\nTexte reconnu sur la photo pour chercher dans les guides : ${recognizedExercise}\nEXTRAITS DES GUIDES ET ANNALES OFFICIELLES :\n${context}`;
    const parts: Array<Record<string, unknown>> = [{ text: prompt }, ...imageParts];
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(key)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts }], generationConfig: { temperature: 0.2 } }),
      signal: AbortSignal.timeout(50000)
    });
    const payload = await response.json();
    if (!response.ok) return NextResponse.json({ error: `Erreur Gemini : ${payload?.error?.message ?? response.statusText}` }, { status: 502 });
    const answer = (payload?.candidates?.[0]?.content?.parts ?? []).map((p: { text?: string }) => p.text ?? "").join("\n").trim();
    if (!answer) return NextResponse.json({ error: "Gemini n’a renvoyé aucune réponse exploitable." }, { status: 502 });

    const warnings = [...guideLoadWarnings, ...annaleLoadWarnings];
    if (subject === "Toutes les matières") warnings.push("Pour rechercher automatiquement dans les annales officielles du CRIPEN, choisis une matière précise.");
    return NextResponse.json({ answer, sources: scored, warning: warnings.length ? warnings.join(" ") : undefined });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Erreur de traitement de la photo ou des documents." }, { status: 500 });
  }
}
