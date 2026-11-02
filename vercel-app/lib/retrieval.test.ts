import assert from "node:assert/strict";
import test from "node:test";
import { rankDocuments } from "./retrieval.ts";

test("a matching official correction ranks ahead of the exam subject", () => {
  const results = rankDocuments([
    { filename: "Sujet BEF 2025", page: 1, text: "Calculer le périmètre du rectangle de longueur et largeur.", sourceKind: "official_subject", year: "2025", subjects: ["Mathématiques"] },
    { filename: "Correction BEF 2025", page: 2, text: "Pour calculer le périmètre du rectangle, additionner longueur et largeur puis multiplier par deux.", sourceKind: "official_correction", year: "2025", subjects: ["Mathématiques"] },
  ], "Calculer le périmètre du rectangle", "Mathématiques", "2025");
  assert.equal(results[0].sourceKind, "official_correction");
});

test("unrelated documents are not returned just because the subject matches", () => {
  assert.deepEqual(rankDocuments([
    { filename: "Guide SVT", page: 4, text: "La cellule est l'unité de base du vivant.", sourceKind: "guide", subjects: ["SVT"] },
  ], "Définir la photosynthèse et expliquer son rôle", "SVT"), []);
});

test("the requested year is strictly isolated", () => {
  const results = rankDocuments([
    { filename: "Correction BEF 2024", page: 2, text: "Calculer le périmètre du rectangle.", sourceKind: "official_correction", year: "2024", subjects: ["Mathématiques"] },
    { filename: "Correction BEF 2025", page: 3, text: "Calculer le périmètre du rectangle.", sourceKind: "official_correction", year: "2025", subjects: ["Mathématiques"] },
  ], "Calculer le périmètre du rectangle", "Mathématiques", "2025");
  assert.equal(results.length, 1);
  assert.equal(results[0].year, "2025");
});

test("the requested subject is strictly isolated", () => {
  const results = rankDocuments([
    { filename: "Correction SVT", page: 1, text: "La cellule et le noyau.", sourceKind: "official_correction", subjects: ["SVT"] },
    { filename: "Correction PC", page: 1, text: "La cellule et le noyau.", sourceKind: "official_correction", subjects: ["Physique-Chimie"] },
  ], "La cellule et le noyau", "SVT");
  assert.equal(results.length, 1);
  assert.equal(results[0].subjects?.[0], "SVT");
});

test("accented and unaccented French terms are normalized", () => {
  const results = rankDocuments([
    { filename: "Guide", page: 1, text: "La photosynthèse permet aux plantes de produire leur matière organique." },
  ], "photosynthese matière organique");
  assert.equal(results.length, 1);
});

test("topK is bounded to avoid oversized contexts", () => {
  const docs = Array.from({ length: 30 }, (_, i) => ({ filename: "Guide " + i, page: 1, text: "La photosynthèse produit de la matière organique." }));
  assert.ok(rankDocuments(docs, "photosynthèse matière organique", "Toutes les matières", "Toutes les sessions", 100).length <= 12);
});
