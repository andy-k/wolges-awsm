#!/usr/bin/env bash
if [ "$1" = "--solve" -a "$#" -ge 2 ]; then
  curl --fail-with-body 'http://localhost:4500/analyze' -d "$2"
else
  echo "usage: $0 --solve '{...}'" >&2
  exit 2
fi
