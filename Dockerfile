from oven/bun:1.1.22
workdir /app
copy src src
copy pkg-web pkg-web
cmd ["run", "src/wolges.ts"]
