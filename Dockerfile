from denoland/deno:1.29.1
workdir /app
copy . ./
run ["deno", "cache", "src/wolges.ts"]
cmd ["run", "--allow-read", "--allow-net", "src/wolges.ts"]
