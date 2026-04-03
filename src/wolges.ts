import init, {
  analyze,
  play_score,
  precache_kbwg,
  precache_klv,
  precache_kwg,
} from "../pkg-web/wolges_wasm.js";

await init();
const precachers: Record<string, (name: string, data: Uint8Array) => void> = {
  klv2: precache_klv,
  kwg: precache_kwg,
  kbwg: precache_kbwg,
  kad: (name, data) => precache_kwg(`${name}.WordSmog`, data),
};
const cachePromises = [];
for await (const dirEntry of Deno.readDir("data")) {
  if (dirEntry.isFile) {
    const m = dirEntry.name.match(/^(.*)\.(klv2|kwg|kbwg|kad)$/);
    if (m) {
      const precacher = precachers[m[2]];
      if (precacher) {
        cachePromises.push((async () =>
          precacher(m[1], await Deno.readFile(`data/${dirEntry.name}`)))());
      }
    }
  }
}
await Promise.all(cachePromises);

const jsonResponseHeaders = { headers: { "Content-Type": "application/json" } };
const pingResponseBody = JSON.stringify({ ok: true });
Deno.serve({ port: 4500 }, async (req) => {
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
  } catch (e: any) {
    console.error(new Date().toISOString(), "error:", e.stack, e, req);
    return new Response(e.stack ?? e, { status: 500 });
  }
});
