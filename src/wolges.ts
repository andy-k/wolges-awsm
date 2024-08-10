import init, {
  analyze,
  play_score,
  precache_klv,
  precache_kwg,
} from "../pkg-web/wolges_wasm.js";
import { readdir } from "node:fs/promises";

await init(Bun.file("pkg-web/wolges_wasm_bg.wasm").bytes());
const cachePromises = [];
for (const dirEntry of await readdir("data", { withFileTypes: true })) {
  if (dirEntry.isFile) {
    const m = dirEntry.name.match(/^(.*)\.(klv2|kwg|kad)$/);
    if (m) {
      switch (m[2]) {
        case "klv2":
          cachePromises.push((async () =>
            precache_klv(
              m[1],
              await Bun.file(`data/${dirEntry.name}`).bytes(),
            ))());
          break;
        case "kwg":
          cachePromises.push((async () =>
            precache_kwg(
              m[1],
              await Bun.file(`data/${dirEntry.name}`).bytes(),
            ))());
          break;
        case "kad":
          cachePromises.push((async () =>
            precache_kwg(
              `${m[1]}.WordSmog`,
              await Bun.file(`data/${dirEntry.name}`).bytes(),
            ))());
          break;
      }
    }
  }
}
await Promise.all(cachePromises);

const jsonResponseHeaders = { headers: { "Content-Type": "application/json" } };
const pingResponseBody = JSON.stringify({ ok: true });
Bun.serve({
  port: 4500,
  fetch: async (req) => {
    try {
      switch (req.method) {
        case "GET":
          switch ((new URL(req.url)).pathname) {
            case "/ping":
              return new Response(pingResponseBody, jsonResponseHeaders);
          }
          break;
        case "POST":
          switch ((new URL(req.url)).pathname) {
            case "/analyze":
              return new Response(
                await analyze(await req.text()),
                jsonResponseHeaders,
              );
            case "/play-score":
              return new Response(
                await play_score(await req.text()),
                jsonResponseHeaders,
              );
          }
          break;
      }
      return new Response("", { status: 404 });
    } catch (e) {
      console.error(new Date().toISOString(), "error:", e.stack, e, req);
      return new Response(e.stack ?? e, { status: 500 });
    }
  },
});
