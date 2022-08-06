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

let runServer = true;
while (runServer) {
  try {
    runServer = false; // do not retry if port not available
    const server = Deno.listen({ port: 4500 });
    runServer = true;
    for await (const conn of server) {
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
                    await reqEvt.respondWith(
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
                    await reqEvt.respondWith(
                      new Response(
                        await analyze(await reqEvt.request.text()),
                        jsonResponseHeaders,
                      ),
                    );
                    responded = true;
                    break;
                  case "/play-score":
                    await reqEvt.respondWith(
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
              await reqEvt.respondWith(new Response("", { status: 404 }));
            }
          } catch (e) {
            console.error(
              new Date().toISOString(),
              "inner error:",
              e.stack,
              e,
              reqEvt.request,
            );
            await reqEvt.respondWith(
              new Response(e.stack ?? e, { status: 500 }),
            );
          }
        }
      })();
    }
    runServer = false; // when is this reached?
  } catch (e) {
    console.error(new Date().toISOString(), "outer error:", e.stack, e);
  }
}
