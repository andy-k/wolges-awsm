from denoland/deno:1.45.4
workdir /app
copy . ./
run ["deno", "cache", "src/wolges.ts"]
cmd ["run", "--allow-read", "--allow-net", "src/wolges.ts"]
