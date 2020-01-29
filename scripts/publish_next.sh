#!/bin/bash

set -ex

# Check current version format
version=$(grep '"version":' package.json | cut -d\" -f4)
if [[ $version =~ "-" ]]; then
    echo "Version format is not X.Y.Z ($version)"
    exit 1
fi

echo "Bump package version."
tag="-next.$CIRCLE_BUILD_NUM"
sed  -i.bak '/version/s/[^0-9]*$/'"$tag\",/" package.json

if [[ -n "$CI" ]];then
    echo "Authenticate with registry."
    if [[ -z "$NPM_TOKEN" ]];then
        echo "Error: NPM_TOKEN is not set."
        exit 1
    fi

    set +x
    echo "//registry.npmjs.org/:_authToken=$NPM_TOKEN" > ~/repo/.npmrc
    set -x
fi
echo "Publish package"
npm publish --tag=next
