#!/usr/bin/env bash

set -euo pipefail

docker build . -t wolges-awsm &&
docker run -p 4500:4500 -v "$(realpath data)":/app/data wolges-awsm
