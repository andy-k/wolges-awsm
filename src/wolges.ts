import init, { analyze, play_score, version } from "../pkg-web/wolges_wasm.js";
import { makeLexicons } from "./lexicons.ts";

await init();

// How long a word graph or leave table stays loaded after the last request
// that named it.
const IDLE_MS = 10 * 60 * 1000;
const lexicons = makeLexicons(IDLE_MS);

// The commits this service was built from: its own, as its image's builder
// stamps it (run.sh, or the workflow that publishes the image), "unknown"
// outside an image; then the wasm's and wolges's, as version() reports them.
const awsmVersion =
  Deno.permissions.querySync({ name: "env", variable: "AWSM_VERSION" })
      .state === "granted"
    ? Deno.env.get("AWSM_VERSION") ?? "unknown"
    : "unknown";

const jsonResponseHeaders = { headers: { "Content-Type": "application/json" } };
const pingResponseBody = JSON.stringify({ ok: true });
const versionResponseBody = JSON.stringify({
  version: `wolges-awsm ${awsmVersion} ${version()}`,
});
const handle = async (req: Request): Promise<Response> => {
  try {
    switch (req.method) {
      case "GET":
        switch ((new URL(req.url)).pathname) {
          case "/ping":
            return new Response(pingResponseBody, jsonResponseHeaders);
          case "/version":
            return new Response(versionResponseBody, jsonResponseHeaders);
        }
        break;
      case "POST": {
        const pathname = (new URL(req.url)).pathname;
        switch (pathname) {
          case "/analyze":
          case "/play-score": {
            const body = await req.text();
            return new Response(
              await lexicons.withRequested(
                body,
                () => (pathname === "/analyze" ? analyze : play_score)(body),
              ),
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
};

// One request from the command line instead of serving, so the wasm can be
// exercised end to end without a port, a second terminal, or a client. It goes
// through the same handler the server does, which is the point: a check that
// runs its own copy of the logic is a check on the copy.
//
//   deno run --allow-read src/wolges.ts analyze sample-analyze.json
//   deno run --allow-read src/wolges.ts play-score sample-play-score.json
//   deno run --allow-read src/wolges.ts ping
//   deno run --allow-read src/wolges.ts version
//
// The body may be "-" to read standard input. Exit status is 0 only for a 200,
// so this is usable as a gate in a script.
const runOnce = async (args: string[]): Promise<never> => {
  const [endpoint, file] = args;
  const pathname = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = `http://localhost:4500${pathname}`;
  const req = file === undefined ? new Request(url) : new Request(url, {
    method: "POST",
    body: file === "-"
      ? await new Response(Deno.stdin.readable).text()
      : await Deno.readTextFile(file),
  });
  const res = await handle(req);
  const text = await res.text();
  // A 404 says the endpoint was misspelled, and its body is empty, so say so
  // here rather than exiting silently.
  if (res.status === 404) {
    console.error(`no such endpoint: ${pathname}`);
  } else if (text) {
    console.log(text);
  }
  Deno.exit(res.status === 200 ? 0 : 1);
};

if (Deno.args.length) {
  await runOnce(Deno.args);
} else {
  Deno.serve({ port: 4500 }, handle);
}
