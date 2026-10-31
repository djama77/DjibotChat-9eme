import assert from "node:assert/strict";
import test from "node:test";
import { rankDocuments } from "./retrieval.ts";

test("a matching official correction ranks ahead of the exam subject", () => {
  const results = rankDocuments(
    [
      { filename: "Sujet BEF 2025", page: 1, text: "Calculer le périmètre du rectangle de longueur et largeur.", sourceKind: "official_subject", year: "2025", subjects: ["Mathématiques"] },
      { filename: "Correction BEF 2025", page: 2, text: "Pour calculer le périmètre du rectangle, additionner longueur et largeur puis multiplier par deux.", sourceKind: "official_correction", year: "2025", subjects: ["Mathématiques"] },
    ],
    "Calculer le périmètre du rectangle", "Mathématiques", "2025",
  );
  assert.equal(results[0].sourceKind, "official_correction");
});

test("unrelated documents are not returned just because the subject matches", () => {
  const results = rankDocuments(
    [{ filename: "Guide SVT", page: 4, text: "La cellule est l'unité de base du vivant.", sourceKind: "guide", subjects: ["SVT"] }],
    "Définir la photosynthèse et expliquer son rôle", "SVT",
  );
  assert.deepEqual(results, []);
});

test("the requested year is preferred when the content matches", () => {
  const results = rankDocuments(
    [
      { filename: "Correction BEF 2024", page: 2, text: "Calculer le périmètre du rectangle.", sourceKind: "official_correction", year: "2024", subjects: ["Mathématiques"] },
      { filename: "Correction BEF 2025", page: 3, text: "Calculer le périmètre du rectangle.", sourceKind: "official_correction", year: "2025", subjects: ["Mathématiques"] },
    ],
    "Calculer le périmètre du rectangle", "Mathématiques", "2025",
  );
  assert.equal(results[0].year, "2025");
});
