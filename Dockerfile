from denoland/deno:1.46.1
workdir /app
copy src src
copy pkg-web pkg-web
run ["deno", "cache", "src/wolges.ts"]
cmd ["run", "--allow-read", "--allow-net", "src/wolges.ts"]
