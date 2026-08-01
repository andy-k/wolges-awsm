import init, {
  analyze,
  play_score,
  precache_kbwg,
  precache_klv,
  precache_kwg,
} from "../pkg-web/wolges_wasm.js";

await init();

// The files a requested name could come from, in try order.
//   leave "X"            -> data/X.klv2
//   lexicon "X.WordSmog" -> data/X.kad, cached under "X.WordSmog"
//   lexicon "X"          -> data/X.kwg, else data/X.kbwg
const WORDSMOG = ".WordSmog";
const candidates = (
  kind: "kwg" | "klv",
  name: string,
): { file: string; load: (data: Uint8Array) => void }[] => {
  if (kind === "klv") {
    return [{ file: `${name}.klv2`, load: (d) => precache_klv(name, d) }];
  }
  if (name.endsWith(WORDSMOG)) {
    const stem = name.slice(0, -WORDSMOG.length);
    return [{ file: `${stem}.kad`, load: (d) => precache_kwg(name, d) }];
  }
  return [
    { file: `${name}.kwg`, load: (d) => precache_kwg(name, d) },
    { file: `${name}.kbwg`, load: (d) => precache_kbwg(name, d) },
  ];
};

// Names that have been settled, whether or not a file was found for them, so a
// caller asking again for something that is not there costs one failed open
// rather than one per request.
const settled = new Set<string>();
const inFlight = new Map<string, Promise<void>>();

const ensure = (
  kind: "kwg" | "klv",
  name: string,
): Promise<void> | undefined => {
  const key = `${kind}:${name}`;
  if (settled.has(key)) return;
  const pending = inFlight.get(key);
  if (pending) return pending;
  // The name arrives in a request and is pasted into a path. The read
  // permission already keeps that inside data/, and a name that is not a bare
  // file name is not a lexicon either.
  if (name.includes("/") || name.includes("\\")) {
    settled.add(key);
    return;
  }
  const promise = (async () => {
    for (const { file, load } of candidates(kind, name)) {
      let data;
      try {
        data = await Deno.readFile(`data/${file}`);
      } catch (e) {
        // Absent, or shut out: try the next spelling. Anything else is a
        // failure to read rather than a verdict on the name, so let it out and
        // leave the name unsettled.
        if (
          e instanceof Deno.errors.NotFound ||
          e instanceof Deno.errors.NotCapable
        ) continue;
        throw e;
      }
      load(data);
      break;
    }
    // Reached whether or not a file was found. The wasm holds a few names of
    // its own ("noleave", the rules) and reports the rest as missing, which is
    // what it did when every file was loaded at boot.
    settled.add(key);
  })().finally(() => inFlight.delete(key));
  inFlight.set(key, promise);
  return promise;
};

// Awaited one after the other, so at most one file's bytes are ever live.
const ensureRequested = async (body: string) => {
  let req;
  try {
    req = JSON.parse(body);
  } catch {
    return; // let the wasm report the malformed request, as it used to
  }
  if (typeof req?.lexicon === "string") await ensure("kwg", req.lexicon);
  if (typeof req?.leave === "string") await ensure("klv", req.leave);
};

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
      case "POST": {
        const pathname = (new URL(req.url)).pathname;
        switch (pathname) {
          case "/analyze":
          case "/play-score": {
            const body = await req.text();
            await ensureRequested(body);
            return new Response(
              await (pathname === "/analyze" ? analyze : play_score)(body),
              jsonResponseHeaders,
            );
          }
        }
        break;
      }
    }
    return new Response("", { status: 404 });
  } catch (e) {
    const stack = e instanceof Error ? e.stack : undefined;
    console.error(new Date().toISOString(), "error:", stack, e, req);
    return new Response(stack ?? String(e), { status: 500 });
  }
});
