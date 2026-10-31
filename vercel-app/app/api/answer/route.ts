import { NextResponse } from "next/server";
import pdf from "pdf-parse";
import mammoth from "mammoth";
import { CRIPEN_ANNales, type AnnaleResource } from "../../../annales";
import { rankDocuments, type SearchDocument } from "../../../lib/retrieval";
import { buildPedagogyMessages, PEDAGOGY_MODES, type PedagogyMode } from "../../../lib/pedagogy";

export const runtime = "nodejs";
export const maxDuration = 60;

type DocChunk = SearchDocument;

function chunks(
  text: string,
  filename: string,
  url?: string,
  metadata: Partial<SearchDocument> = {},
): DocChunk[] {
  const pages = text.split("\f");
  const output: DocChunk[] = [];
  pages.forEach((page, index) => {
    const clean = page.replace(/\s+/g, " ").trim();
    for (let start = 0; start < clean.length; start += 850) {
      const piece = clean.slice(start, start + 1000).trim();
      if (piece) {
        output.push({
          filename,
          page: index + 1,
          text: piece,
          sourceKind: "guide",
          ...(url ? { url } : {}),
          ...metadata,
        });
      }
    }
  });
  return output;
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
      if (!response.ok) {
        throw new Error("Impossible de charger le guide " + guide.filename + " (HTTP " + response.status + ").");
      }
      const parsed = await pdf(Buffer.from(await response.arrayBuffer()));
      if (!parsed.text.trim()) {
        throw new Error("Le guide " + guide.filename + " ne contient pas de couche texte exploitable. Préparez-le avec le script OCR local.");
      }
      return chunks(parsed.text, guide.filename, guide.url, {
        sourceKind: "guide",
        subjects: guide.subjects,
      });
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

  const WordExtractor = require("word-extractor") as new () => {
    extract(input: Buffer): Promise<{ getBody(): string }>;
  };
  const extractor = new WordExtractor();
  const document = await extractor.extract(buffer);
  return document.getBody();
}

async function loadAnnale(resource: AnnaleResource): Promise<DocChunk[]> {
  let cached = annaleCache.get(resource.url);
  if (!cached) {
    cached = (async () => {
      const response = await fetch(resource.url, { signal: AbortSignal.timeout(16000) });
      if (!response.ok) {
        throw new Error("Le document CRIPEN « " + resource.title + " » est indisponible (HTTP " + response.status + ").");
      }
      const buffer = Buffer.from(await response.arrayBuffer());
      const text = await extractDocument(buffer, resource.format);
      if (!text.trim()) {
        throw new Error("Aucun texte extractible dans « " + resource.title + " ». Le document devra être préparé avec OCRmyPDF.");
      }
      return chunks(text, resource.title, resource.url, {
        sourceKind: resource.kind === "Correction officielle" ? "official_correction" : "official_subject",
        year: resource.year,
        subjects: resource.subjects,
      });
    })();
    annaleCache.set(resource.url, cached);
    cached.catch(() => annaleCache.delete(resource.url));
  }
  return cached;
}

export async function POST(request: Request) {
  try {
    const key = process.env.OPENROUTER_API_KEY?.trim();
    if (!key) {
      return NextResponse.json(
        { error: "OPENROUTER_API_KEY n'est pas configurée dans les variables d'environnement Vercel." },
        { status: 503 },
      );
    }

    const form = await request.formData();
    const question = String(form.get("question") ?? "").trim();
    const subject = String(form.get("subject") ?? "Toutes les matières");
    const examYear = String(form.get("examYear") ?? "2025");
    const rawMode = String(form.get("mode") ?? "corrige");
    const mode = Object.hasOwn(PEDAGOGY_MODES, rawMode) ? rawMode as PedagogyMode : "corrige";
    const studentAnswer = String(form.get("studentAnswer") ?? "").slice(0, 6000);
    if (mode === "erreur" && !studentAnswer.trim()) return NextResponse.json({ error: "Ajoute ta réponse pour comprendre ton erreur." }, { status: 400 });
    const recognizedExercise = String(form.get("recognizedExercise") ?? "").trim().slice(0, 12000);
    const uploaded = form.getAll("guides").filter((value): value is File => value instanceof File && value.size > 0);

    if (!question && !recognizedExercise && uploaded.length === 0) {
      return NextResponse.json({ error: "Ajoute une photo lisible, un document ou écris ta question." }, { status: 400 });
    }
    if (uploaded.length > 8) {
      return NextResponse.json({ error: "Ajoute au maximum 8 documents à la fois." }, { status: 400 });
    }

    const docs: DocChunk[] = [];
    const selectedGuides = subject === "Toutes les matières"
      ? REPOSITORY_GUIDES
      : REPOSITORY_GUIDES.filter((guide) => guide.subjects.includes(subject));
    const guideResults = await Promise.allSettled(selectedGuides.map(loadRepositoryGuide));
    for (const result of guideResults) {
      if (result.status === "fulfilled") docs.push(...result.value);
    }
    const guideLoadWarnings = guideResults
      .filter((result): result is PromiseRejectedResult => result.status === "rejected")
      .map((result) => result.reason instanceof Error ? result.reason.message : "Un guide du dépôt GitHub n'a pas pu être chargé.");

    const selectedAnnales = subject !== "Toutes les matières"
      ? CRIPEN_ANNales.filter(
          (item) =>
            item.subjects.includes(subject as "Mathématiques" | "SVT" | "Physique-Chimie" | "Français") &&
            (examYear === "Toutes les sessions" || item.year === examYear),
        )
      : [];
    const annaleResults = await Promise.allSettled(selectedAnnales.map(loadAnnale));
    for (const result of annaleResults) {
      if (result.status === "fulfilled") docs.push(...result.value);
    }
    const annaleLoadWarnings = annaleResults
      .filter((result): result is PromiseRejectedResult => result.status === "rejected")
      .map((result) => result.reason instanceof Error ? result.reason.message : "Une annale du CRIPEN n'a pas pu être chargée.");

    for (const file of uploaded) {
      if (file.size > 8 * 1024 * 1024) {
        return NextResponse.json({ error: "Le fichier " + file.name + " dépasse 8 Mo." }, { status: 413 });
      }
      const name = file.name.toLowerCase();
      const buffer = Buffer.from(await file.arrayBuffer());
      if (file.type === "application/pdf" || name.endsWith(".pdf")) {
        const text = await extractDocument(buffer, "pdf");
        if (!text.trim()) {
          return NextResponse.json(
            { error: "Le PDF joint semble scanné sans texte sélectionnable. Prépare-le avec OCRmyPDF puis importe la version OCR." },
            { status: 422 },
          );
        }
        docs.push(...chunks(text, file.name));
      } else if (name.endsWith(".docx") || file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
        docs.push(...chunks(await extractDocument(buffer, "docx"), file.name));
      } else if (name.endsWith(".doc") || file.type === "application/msword") {
        docs.push(...chunks(await extractDocument(buffer, "doc"), file.name));
      } else if (file.type.startsWith("image/")) {
        return NextResponse.json(
          { error: "Les photos sont reconnues dans le navigateur. Réessaie depuis le formulaire pour lancer l'OCR local." },
          { status: 400 },
        );
      } else {
        return NextResponse.json(
          { error: "Format non pris en charge pour " + file.name + ". Utilise une photo JPG/PNG/WEBP, un PDF ou un document Word." },
          { status: 400 },
        );
      }
    }

    const searchText = [question, recognizedExercise].filter(Boolean).join("\n");
    const scored = rankDocuments(docs, searchText, subject, examYear, 8);
    const context = scored.length
      ? scored.map((source) => {
          const kind = source.sourceKind === "official_correction"
            ? "CORRECTION OFFICIELLE CRIPEN"
            : source.sourceKind === "official_subject"
              ? "SUJET OFFICIEL CRIPEN (PAS UN CORRIGÉ)"
              : "GUIDE DU PROFESSEUR / DOCUMENT JOINT";
          const year = source.year ? " ; session BEF " + source.year : "";
          const url = source.url ? " ; lien source : " + source.url : "";
          return "[Type : " + kind + year + " ; source : " + source.filename + " ; page/segment : " + source.page + url + "]\n" + source.text;
        }).join("\n\n")
      : "[Aucun extrait suffisamment pertinent retrouvé dans les guides et annales sélectionnés.]";

    const messages = buildPedagogyMessages({ mode, question, recognizedExercise, studentAnswer, subject, year: examYear, context });

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + key,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://djibotchat-9eme.vercel.app",
        "X-Title": "DjibotChat 9e année",
      },
      body: JSON.stringify({
        model: "openrouter/free",
        messages,
        temperature: 0.2,
        stream: false,
      }),
      signal: AbortSignal.timeout(50000),
    });

    const payload = await response.json();
    if (!response.ok) {
      const message = payload?.error?.message ?? response.statusText;
      return NextResponse.json({ error: "Erreur OpenRouter : " + message }, { status: 502 });
    }

    const message = payload?.choices?.[0]?.message?.content;
    const answer = typeof message === "string"
      ? message.trim()
      : Array.isArray(message)
        ? message.map((part: { text?: string }) => part.text ?? "").join("\n").trim()
        : "";
    if (!answer) {
      return NextResponse.json({ error: "OpenRouter n'a renvoyé aucune réponse exploitable." }, { status: 502 });
    }

    const warnings = [...guideLoadWarnings, ...annaleLoadWarnings];
    if (subject === "Toutes les matières") {
      warnings.push("Choisis une matière précise pour rechercher également dans les annales officielles du CRIPEN.");
    }
    if (!scored.some((source) => source.sourceKind === "official_correction")) {
      warnings.push("Aucun passage de correction officielle CRIPEN n'a été classé parmi les extraits retrouvés.");
    }

    return NextResponse.json({
      answer,
      sources: scored,
      warning: warnings.length ? warnings.join(" ") : undefined,
      model: payload.model ?? "openrouter/free",
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur de traitement de la question ou des documents." },
      { status: 500 },
    );
  }
}
