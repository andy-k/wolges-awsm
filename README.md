# Wolges-awsm

Wolges: a web service module

## About

Wolges-awsm provides Wolges-wasm as an API.

Wolges-awsm includes Wolges-wasm as a precompiled binary.

## License

Copyright (C) 2020-2026 Andy Kurnia.\
Released under the MIT license.

## Related Projects

- https://github.com/andy-k/wolges
- https://github.com/andy-k/wolges-wasm
- https://github.com/woogles-io/liwords

## Usage

Clone liwords at the same level as this repo.

Give src/wolges.ts --idle-ms=<ms> for how long a lexicon may go unused
before it is unloaded (ten minutes without it), or --idle-ms=never to keep
each one loaded: `deno task serve --idle-ms=never`.

## GitHub Badge

- [![Actions](https://github.com/andy-k/wolges-awsm/actions/workflows/actions.yml/badge.svg)](https://github.com/andy-k/wolges-awsm/actions/workflows/actions.yml)
