from denoland/deno:1.45.5
workdir /app
copy . ./
run ["deno", "cache", "src/wolges.ts"]
cmd ["run", "--allow-read", "--allow-net", "src/wolges.ts"]
