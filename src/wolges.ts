import init, {
  analyze,
  play_score,
  precache_klv,
  precache_kwg,
} from "../pkg-web/wolges_wasm.js";

await init(Deno.readFile("pkg-web/wolges_wasm_bg.wasm"));
await Promise.all(
  [
    ...["english", "french", "german", "norwegian"].map(async (k) =>
      precache_klv(k, await Deno.readFile(`data/${k}.klv`))
    ),
    ...[
      "CSW19",
      "CSW19X",
      "CSW21",
      "NWL20",
      "NWL18",
      "NSWL20",
      "ECWL",
      "FRA20",
      "RD28",
      "NSF21",
    ].map(async (k) =>
      Promise.all([
        precache_kwg(k, await Deno.readFile(`data/${k}.kwg`)),
        precache_kwg(`${k}.WordSmog`, await Deno.readFile(`data/${k}.kad`)),
      ])
    ),
  ],
);

for await (const conn of Deno.listen({ port: 4500 })) {
  (async () => {
    const jsonResponseHeaders = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    const pingResponseBody = JSON.stringify({ ok: true });
    for await (const reqEvt of Deno.serveHttp(conn)) {
      let responded = false;
      try {
        switch (reqEvt.request.method) {
          case "GET":
            switch ((new URL(reqEvt.request.url)).pathname) {
              case "/ping":
                reqEvt.respondWith(
                  new Response(
                    pingResponseBody,
                    jsonResponseHeaders,
                  ),
                );
                responded = true;
                break;
            }
            break;
          case "POST":
            switch ((new URL(reqEvt.request.url)).pathname) {
              case "/analyze":
                reqEvt.respondWith(
                  new Response(
                    await analyze(await reqEvt.request.text()),
                    jsonResponseHeaders,
                  ),
                );
                responded = true;
                break;
              case "/play-score":
                reqEvt.respondWith(
                  new Response(
                    await play_score(await reqEvt.request.text()),
                    jsonResponseHeaders,
                  ),
                );
                responded = true;
                break;
            }
            break;
        }
        if (!responded) {
          reqEvt.respondWith(new Response("", { status: 404 }));
        }
      } catch (e) {
        reqEvt.respondWith(new Response(e.stack ?? e, { status: 500 }));
      }
    }
  })();
}
