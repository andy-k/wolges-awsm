// Needs the lexicons under data/, so it runs where they are:
//   deno test --allow-read=data,pkg-web,. src/lexicons_test.ts
import init, { analyze } from "../pkg-web/wolges_wasm.js";
import { makeLexicons, MAX_TIMEOUT_MS, parseIdleMs } from "./lexicons.ts";

await init();

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const check = (ok: boolean, what: string) => {
  if (!ok) throw new Error(what);
};
const body = await Deno.readTextFile("sample-analyze.json");
const IDLE_MS = 20;
const PAST_IDLE_MS = 200;

Deno.test("--idle-ms takes a number of ms, at least 0, or never", () => {
  check(parseIdleMs("600000") === 600000, "a number of ms");
  check(parseIdleMs("0") === 0, "none at all");
  check(parseIdleMs("never") === Infinity, "never: kept for good");
  for (const refused of ["", " ", "-1", "abc", "Infinity", "NaN"]) {
    let said = "";
    try {
      parseIdleMs(refused);
    } catch (e) {
      said = String(e);
    }
    check(said.includes("--idle-ms"), `${JSON.stringify(refused)} is refused`);
  }
});

Deno.test("an idle table is evicted and the next request loads it again", async () => {
  const lexicons = makeLexicons(IDLE_MS);
  const first = await lexicons.withRequested(body, () => analyze(body));
  check(lexicons.resident.size === 2, "the word graph and leave table load");
  await sleep(PAST_IDLE_MS);
  check(lexicons.resident.size === 0, "both are evicted once idle");
  let said = "";
  try {
    await analyze(body);
  } catch (e) {
    said = String(e);
  }
  check(said.includes("missing"), `the wasm no longer holds them: ${said}`);
  const second = await lexicons.withRequested(body, () => analyze(body));
  check(second === first, "the next request loads them and answers the same");
  await sleep(PAST_IDLE_MS);
});

Deno.test("a request keeps its tables while it waits", async () => {
  const lexicons = makeLexicons(IDLE_MS);
  // leaves an idle timer running on both tables
  await lexicons.withRequested(body, () => analyze(body));
  const answer = await lexicons.withRequested(body, async () => {
    await sleep(PAST_IDLE_MS);
    return await analyze(body);
  });
  check(answer.length > 0, "answered after waiting past the idle time");
  await sleep(PAST_IDLE_MS);
  check(lexicons.resident.size === 0, "evicted once the request is done");
});

Deno.test("an idle time past one timer's longest is waited out in turns", async () => {
  // turns of at most a quarter of the idle time: evicted only once all are
  const lexicons = makeLexicons(IDLE_MS * 4, IDLE_MS);
  await lexicons.withRequested(body, () => analyze(body));
  await sleep(IDLE_MS * 2);
  check(lexicons.resident.size === 2, "kept until every turn is waited out");
  await sleep(PAST_IDLE_MS);
  check(lexicons.resident.size === 0, "both are evicted once idle");
});

// The tests below leave the tables loaded in the wasm, so they come last.

Deno.test("an idle time of Infinity keeps the tables for good", async () => {
  const lexicons = makeLexicons(Infinity);
  await lexicons.withRequested(body, () => analyze(body));
  await sleep(PAST_IDLE_MS);
  check(lexicons.resident.size === 2, "both are still loaded");
  const answer = await analyze(body);
  check(answer.length > 0, "the wasm still holds them");
});

Deno.test({
  name: "an idle time past setTimeout's longest is not cut short",
  // its first turn is still waiting when the test ends, unref'd
  sanitizeOps: false,
  fn: async () => {
    const lexicons = makeLexicons(MAX_TIMEOUT_MS + 1);
    await lexicons.withRequested(body, () => analyze(body));
    await sleep(PAST_IDLE_MS);
    check(lexicons.resident.size === 2, "both are still loaded");
  },
});
