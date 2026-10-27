import { NextResponse } from "next/server";
import pdf from "pdf-parse";

export const runtime = "nodejs";
export const maxDuration = 60;

function tokens(text: string): string[] {
  const stop = new Set("le la les un une des du de d et ou a au aux en dans pour par sur avec est sont qui que quoi comment pourquoi exercice question calculer déterminer montrer donner soit ce cette ces leur on nous vous ils elles il elle être avoir faire plus moins comme mais donc quel quelle quels quelles".split(" "));
  return (text.toLocaleLowerCase("fr").match(/[a-zà-ÿ0-9]+/gi) ?? []).filter(t => t.length > 1 && !stop.has(t));
}
function chunks(text: string, filename: string): Array<{filename:string;page:number;text:string}> {
  const pages = text.split("\f"); const out: Array<{filename:string;page:number;text:string}> = [];
  pages.forEach((page, i) => { const clean = page.replace(/\s+/g, " ").trim(); for (let start=0; start<clean.length; start+=850) { const piece=clean.slice(start, start+1000).trim(); if(piece) out.push({filename,page:i+1,text:piece}); } });
  return out;
}

export async function POST(request: Request) {
  try {
    const key = process.env.GEMINI_API_KEY;
    if (!key) return NextResponse.json({error:"La clé GEMINI_API_KEY n’est pas encore configurée dans les variables d’environnement Vercel."},{status:500});
    const form = await request.formData();
    const question = String(form.get("question") ?? "").trim();
    const subject = String(form.get("subject") ?? "Toutes les matières");
    const uploaded = form.getAll("guides").filter((v): v is File => v instanceof File && v.size > 0);
    if (!question && !uploaded.some(f => f.type.startsWith("image/"))) return NextResponse.json({error:"Ajoute une photo de l’exercice ou écris ta question."},{status:400});
    if (uploaded.length > 8) return NextResponse.json({error:"Ajoute au maximum 8 photos ou guides à la fois."},{status:400});
    const docs: Array<{filename:string;page:number;text:string}> = [];
    const imageParts: Array<{inline_data:{mime_type:string;data:string}}> = [];
    for (const file of uploaded) {
      if (file.size > 8 * 1024 * 1024) return NextResponse.json({error:`Le fichier ${file.name} dépasse 8 Mo.`},{status:413});
      if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
        const parsed = await pdf(Buffer.from(await file.arrayBuffer()));
        docs.push(...chunks(parsed.text, file.name));
      } else if (file.type.startsWith("image/")) {
        const supported = ["image/jpeg","image/png","image/webp","image/heic","image/heif"];
        if (!supported.includes(file.type)) return NextResponse.json({error:`Le format photo ${file.type} n’est pas pris en charge. Utilise JPG, PNG ou WEBP.`},{status:400});
        imageParts.push({inline_data:{mime_type:file.type,data:Buffer.from(await file.arrayBuffer()).toString("base64")}});
      } else {
        return NextResponse.json({error:`Format non pris en charge pour ${file.name}. Utilise une photo ou un PDF.`},{status:400});
      }
    }
    const effectiveQuestion = question || "Lis attentivement la photo de l’exercice, identifie la matière et toutes les questions, puis donne un corrigé détaillé adapté à un élève de 9ème à Djibouti.";
    const qTokens = new Set(tokens(effectiveQuestion));
    const scored = docs.map(d => {
      const dt = tokens(d.text); const unique = new Set(dt); let common = 0; qTokens.forEach(t => { if(unique.has(t)) common++; });
      let score = common / Math.max(1,qTokens.size);
      const filename = d.filename.toLowerCase();
      const terms: Record<string,string[]> = {"Mathématiques":["math","mathematique"],"SVT":["svt","science"],"Physique-Chimie":["pc","physique","chimie"],"Français":["fr","francais"],"Anglais":["anglais","english"],"Histoire-Géographie":["histoire","geo"],"Informatique":["info"]};
      if(subject !== "Toutes les matières" && (terms[subject] ?? []).some(t=>filename.includes(t))) score += .2;
      return {...d,score};
    }).filter(d=>d.score>=.08).sort((a,b)=>b.score-a.score).slice(0,6);
    const context = scored.length ? scored.map(s=>`[Source : ${s.filename}, page PDF ${s.page}]\n${s.text}`).join("\n\n") : "[Aucun extrait suffisamment pertinent retrouvé dans les guides PDF joints à cette demande.]";
    const prompt = `Tu es un assistant pédagogique pour les élèves de 9e année à Djibouti. Réponds en français simple, étape par étape. Lis d’abord attentivement la photo jointe et retranscris mentalement l’énoncé sans inventer les parties illisibles. Utilise en priorité les extraits des guides PDF ci-dessous pour chercher un corrigé correspondant. Si un passage répond à l’exercice, explique le corrigé et cite le fichier et la page. Si aucun corrigé correspondant n’est présent dans les extraits, écris « CORRIGÉ DU GUIDE NON RETROUVÉ » puis propose une résolution indépendante en indiquant clairement qu’elle n’a pas été vérifiée dans le guide. Si la photo est floue ou incomplète, demande une nouvelle photo plutôt que d’inventer. Montre les étapes de calcul et explique les notions au niveau 9ème.\nMatière choisie : ${subject}\nConsigne de l’élève : ${effectiveQuestion}\nEXTRAITS DES GUIDES PDF JOINTS :\n${context}`;
    const parts: Array<Record<string,unknown>> = [{text:prompt}, ...imageParts];
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(key)}`, {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({contents:[{parts}],generationConfig:{temperature:.2}}),signal:AbortSignal.timeout(50000)});
    const payload = await response.json();
    if (!response.ok) return NextResponse.json({error:`Erreur Gemini : ${payload?.error?.message ?? response.statusText}`},{status:502});
    const answer = (payload?.candidates?.[0]?.content?.parts ?? []).map((p:{text?:string})=>p.text ?? "").join("\n").trim();
    if (!answer) return NextResponse.json({error:"Gemini n’a renvoyé aucune réponse exploitable."},{status:502});
    return NextResponse.json({answer,sources:scored});
  } catch (e) {
    return NextResponse.json({error:e instanceof Error ? e.message : "Erreur de traitement de la photo ou des guides PDF."},{status:500});
  }
}
