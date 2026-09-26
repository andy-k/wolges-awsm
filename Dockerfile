from denoland/deno:2.9.7
workdir /app
copy src src
copy pkg-web pkg-web
run ["deno", "cache", "src/wolges.ts"]
cmd ["run", "--allow-read=data,pkg-web", "--allow-net=0.0.0.0:4500", "src/wolges.ts"]
