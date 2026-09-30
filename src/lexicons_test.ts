// Needs the lexicons under data/, so it runs where they are:
//   deno test --allow-read=data,pkg-web,. src/lexicons_test.ts
import init, { analyze } from "../pkg-web/wolges_wasm.js";
import { makeLexicons } from "./lexicons.ts";

await init();

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const check = (ok: boolean, what: string) => {
  if (!ok) throw new Error(what);
};
const body = await Deno.readTextFile("sample-analyze.json");
const IDLE_MS = 20;
const PAST_IDLE_MS = 200;

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
