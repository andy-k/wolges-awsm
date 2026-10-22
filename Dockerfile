from denoland/deno:2.9.8
workdir /app
copy src src
copy pkg-web pkg-web
run ["deno", "cache", "src/wolges.ts"]
# the commit this image is built from, as its builder stamps it (run.sh, or
# the workflow that publishes the image); src/wolges.ts reports it at /version
arg AWSM_VERSION=unknown
env AWSM_VERSION=$AWSM_VERSION
cmd ["run", "--allow-read=data,pkg-web", "--allow-net=0.0.0.0:4500", "--allow-env=AWSM_VERSION", "src/wolges.ts"]
