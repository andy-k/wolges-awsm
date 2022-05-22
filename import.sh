#!/usr/bin/env bash

set -euo pipefail

rsync -HPavz --delete --exclude=.gitignore ../wolges-wasm/pkg-web/ pkg-web/
