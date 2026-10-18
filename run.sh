#!/usr/bin/env bash

set -euo pipefail

# the image is stamped with the commit it is built from, as wolges's build.rs
# stamps wolges: <the commit's time in UTC>-<its short sha>, with "-dirty" when
# what the image copies has uncommitted changes; "unknown" where git cannot say
stamp=unknown
if [ "$(git rev-parse --show-toplevel 2>/dev/null)" = "$(pwd -P)" ]; then
  when="$(TZ=UTC0 git log -1 --format=%cd --date=format-local:%Y%m%dT%H%M%SZ)"
  stamp="$when-$(git rev-parse --short HEAD)"
  dirty="$(GIT_OPTIONAL_LOCKS=0 git status --porcelain --untracked-files=no \
    -- Dockerfile pkg-web src)"
  [ -z "$dirty" ] || stamp="$stamp-dirty"
fi

docker build . -t wolges-awsm --build-arg "AWSM_VERSION=$stamp" &&
docker run -p 4500:4500 -v "$(realpath data)":/app/data wolges-awsm
