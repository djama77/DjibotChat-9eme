import assert from "node:assert/strict";
import test from "node:test";
import { requestGeminiWithRetry } from "./gemini.ts";

test("retries temporary Gemini overload and succeeds", async () => {
  let calls = 0;
  const waits: number[] = [];
  const result = await requestGeminiWithRetry("https://example.test/gemini", { method: "POST" }, {
    fetcher: async () => {
      calls += 1;
      return calls < 3
        ? new Response(JSON.stringify({ error: { message: "high demand" } }), { status: 503 })
        : new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: "Réponse" }] } }] }), { status: 200 });
    },
    sleep: async (ms) => { waits.push(ms); },
  });
  assert.equal(calls, 3);
  assert.deepEqual(waits, [600, 1200]);
  assert.equal(result.response.status, 200);
  assert.equal(result.attempts, 3);
  assert.equal(result.payload.candidates[0].content.parts[0].text, "Réponse");
});

test("does not retry non-transient client errors", async () => {
  let calls = 0;
  const result = await requestGeminiWithRetry("https://example.test/gemini", { method: "POST" }, {
    fetcher: async () => { calls += 1; return new Response("bad request", { status: 400 }); },
    sleep: async () => { throw new Error("should not sleep"); },
  });
  assert.equal(calls, 1);
  assert.equal(result.response.status, 400);
});

test("returns the final overload response after bounded attempts", async () => {
  let calls = 0;
  const result = await requestGeminiWithRetry("https://example.test/gemini", { method: "POST" }, {
    fetcher: async () => { calls += 1; return new Response(JSON.stringify({ error: { message: "busy" } }), { status: 503 }); },
    sleep: async () => {},
  });
  assert.equal(calls, 3);
  assert.equal(result.response.status, 503);
  assert.equal(result.attempts, 3);
});

test("retries a transient network failure", async () => {
  let calls = 0;
  const result = await requestGeminiWithRetry("https://example.test/gemini", { method: "POST" }, {
    fetcher: async () => {
      calls += 1;
      if (calls === 1) throw new Error("temporary network error");
      return new Response(JSON.stringify({ candidates: [] }), { status: 200 });
    },
    sleep: async () => {},
  });
  assert.equal(calls, 2);
  assert.equal(result.response.status, 200);
});
