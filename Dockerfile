from denoland/deno:2.8.2
workdir /app
copy src src
copy pkg-web pkg-web
run ["deno", "cache", "src/wolges.ts"]
healthcheck --interval=30s --timeout=3s --start-period=10s --retries=3 cmd ["deno", "eval", "try { const r = await fetch('http://127.0.0.1:4500/ping'); if (!r.ok) Deno.exit(1); } catch { Deno.exit(1); }"]
cmd ["run", "--allow-read=data,pkg-web", "--allow-net=0.0.0.0:4500", "src/wolges.ts"]
