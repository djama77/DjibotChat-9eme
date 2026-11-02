export type SourceKind = "guide" | "official_subject" | "official_correction";
export type SearchDocument = {
  filename: string; page: number; text: string; url?: string;
  sourceKind?: SourceKind; year?: string; subjects?: string[];
};
export type RankedDocument = SearchDocument & { score: number; matchedTerms: number; matchRatio: number };

const STOP_WORDS = new Set(
  "le la les un une des du de d et ou a au aux en dans pour par sur avec est sont qui que quoi comment pourquoi exercice question calculer déterminer montrer donner soit ce cette ces leur leurs on nous vous ils elles il elle être avoir faire plus moins comme mais donc où quel quelle quels quelles the an and or is of in to with what how why".split(" "),
);

export function tokenize(text: string): string[] {
  return (text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("fr").match(/[a-z0-9]+/g) ?? [])
    .filter((token) => token.length > 1 && !STOP_WORDS.has(token));
}

/** BM25 with strict subject/session filtering and modest exact-phrase preference. */
export function rankDocuments(
  documents: SearchDocument[],
  query: string,
  subject = "Toutes les matières",
  year = "Toutes les sessions",
  topK = 8,
): RankedDocument[] {
  const queryTerms = [...new Set(tokenize(query))];
  if (!queryTerms.length || !documents.length || topK < 1) return [];

  const scoped = documents.filter((document) => {
    if (subject !== "Toutes les matières" && document.subjects?.length && !document.subjects.includes(subject)) return false;
    if (year !== "Toutes les sessions" && document.year && document.year !== year) return false;
    return true;
  });
  if (!scoped.length) return [];

  const tokenized = scoped.map((document) => tokenize(document.text));
  const averageLength = tokenized.reduce((total, terms) => total + terms.length, 0) / Math.max(1, tokenized.length);
  const documentFrequency = new Map<string, number>();
  for (const terms of tokenized) for (const term of new Set(terms)) {
    documentFrequency.set(term, (documentFrequency.get(term) ?? 0) + 1);
  }

  const k1 = 1.5, b = 0.75, totalDocuments = scoped.length;
  const normalizedQuery = query.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("fr").replace(/\s+/g, " ").trim();

  return scoped.map((document, index) => {
    const terms = tokenized[index];
    const frequencies = new Map<string, number>();
    for (const term of terms) frequencies.set(term, (frequencies.get(term) ?? 0) + 1);
    let score = 0, matchedTerms = 0;
    for (const term of queryTerms) {
      const frequency = frequencies.get(term) ?? 0;
      if (!frequency) continue;
      matchedTerms += 1;
      const df = documentFrequency.get(term) ?? 0;
      const idf = Math.log(1 + (totalDocuments - df + 0.5) / (df + 0.5));
      const denominator = frequency + k1 * (1 - b + b * (terms.length / Math.max(1, averageLength)));
      score += idf * ((frequency * (k1 + 1)) / denominator);
    }
    const matchRatio = matchedTerms / queryTerms.length;
    if (!matchedTerms || matchRatio < 0.15) return { ...document, score: 0, matchedTerms, matchRatio };
    const normalizedText = document.text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("fr").replace(/\s+/g, " ");
    if (normalizedQuery.length >= 12 && normalizedText.includes(normalizedQuery)) score *= 1.2;
    score += 0.25 * matchRatio;
    if (document.sourceKind === "official_correction") score *= 1.35;
    else if (document.sourceKind === "official_subject") score *= 1.03;
    return { ...document, score, matchedTerms, matchRatio };
  }).filter((document) => document.score > 0)
    .sort((left, right) => right.score - left.score || right.matchRatio - left.matchRatio)
    .slice(0, Math.min(topK, 12));
}
