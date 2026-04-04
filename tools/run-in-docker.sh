#!/usr/bin/env bash

set -x

docker run --rm -ti -v $(pwd):/website -w /website \
    --publish 3000:3000 \
    --entrypoint yarn \
    registry.cn-beijing.aliyuncs.com/swordqiu/node:20-alpine-git \
    "$@"
