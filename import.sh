#!/usr/bin/env bash

set -euo pipefail

rsync -HPavz --checksum --delete --exclude=.gitignore ../wolges-wasm/pkg-web/ pkg-web/
