#!/usr/bin/env bash

set -x

docker run --rm -ti -v $(pwd):/website -w /website \
    --publish 3000:3000 \
    --entrypoint yarn node:21.3.0-alpine3.17 "$@"
