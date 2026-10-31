export type SourceKind = "guide" | "official_subject" | "official_correction";
export type SearchDocument = {
  filename: string; page: number; text: string; url?: string;
  sourceKind?: SourceKind; year?: string; subjects?: string[];
};
export type RankedDocument = SearchDocument & { score: number };

const STOP_WORDS = new Set(
  "le la les un une des du de d et ou a au aux en dans pour par sur avec est sont qui que quoi comment pourquoi exercice question calculer déterminer montrer donner soit ce cette ces leur leurs on nous vous ils elles il elle être avoir faire plus moins comme mais donc où quel quelle quels quelles the an and or is of in to with what how why".split(" "),
);

export function tokenize(text: string): string[] {
  return (text.toLocaleLowerCase("fr").match(/[a-zà-ÿ0-9]+/gi) ?? [])
    .filter((token) => token.length > 1 && !STOP_WORDS.has(token));
}

/** BM25 retrieval; matching CRIPEN corrections rank above subjects and guides. */
export function rankDocuments(
  documents: SearchDocument[],
  query: string,
  subject = "Toutes les matières",
  year = "Toutes les sessions",
  topK = 8,
): RankedDocument[] {
  const queryTerms = [...new Set(tokenize(query))];
  if (!queryTerms.length || !documents.length || topK < 1) return [];

  const tokenized = documents.map((document) => tokenize(document.text));
  const averageLength =
    tokenized.reduce((total, terms) => total + terms.length, 0) /
    Math.max(1, tokenized.length);
  const documentFrequency = new Map<string, number>();

  for (const terms of tokenized) {
    for (const term of new Set(terms)) {
      documentFrequency.set(term, (documentFrequency.get(term) ?? 0) + 1);
    }
  }

  const k1 = 1.5;
  const b = 0.75;
  const totalDocuments = documents.length;

  return documents
    .map((document, index) => {
      const terms = tokenized[index];
      const frequencies = new Map<string, number>();
      for (const term of terms) frequencies.set(term, (frequencies.get(term) ?? 0) + 1);

      let score = 0;
      let matchedTerms = 0;
      for (const term of queryTerms) {
        const frequency = frequencies.get(term) ?? 0;
        if (!frequency) continue;
        matchedTerms += 1;
        const df = documentFrequency.get(term) ?? 0;
        const idf = Math.log(1 + (totalDocuments - df + 0.5) / (df + 0.5));
        const denominator = frequency + k1 * (1 - b + b * (terms.length / Math.max(1, averageLength)));
        score += idf * ((frequency * (k1 + 1)) / denominator);
      }

      if (!matchedTerms) return { ...document, score: 0 };
      score += 0.25 * (matchedTerms / queryTerms.length);
      if (document.sourceKind === "official_correction") score *= 1.7;
      else if (document.sourceKind === "official_subject") score *= 1.05;
      if (subject !== "Toutes les matières" && document.subjects?.includes(subject)) score *= 1.08;
      if (year !== "Toutes les sessions" && document.year === year) score *= 1.08;
      return { ...document, score };
    })
    .filter((document) => document.score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, topK);
}
