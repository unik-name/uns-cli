#!/bin/bash

set -e

AWS_S3_ENDPOINT="https://s3.fr-par.scw.cloud"
export AWS_S3_ENDPOINT

echo -n "Is SCALEWAY_UNS_CLI_S3_BUCKET_ACCESS_KEY set... "
if [ -z "$SCALEWAY_UNS_CLI_S3_BUCKET_ACCESS_KEY" ]; then
    echo "no"
    echo "SCALEWAY_UNS_CLI_S3_BUCKET_ACCESS_KEY envvar is required"
    exit 1
else
    echo "yes"
fi
export AWS_ACCESS_KEY_ID="${SCALEWAY_UNS_CLI_S3_BUCKET_ACCESS_KEY}"

echo -n "Is SCALEWAY_UNS_CLI_S3_BUCKET_SECRET_KEY set... "
if [ -z "$SCALEWAY_UNS_CLI_S3_BUCKET_SECRET_KEY" ]; then
    echo "no"
    echo "SCALEWAY_UNS_CLI_S3_BUCKET_SECRET_KEY envvar is required";
    exit 1;
else
    echo "yes"
fi
export AWS_SECRET_ACCESS_KEY="${SCALEWAY_UNS_CLI_S3_BUCKET_SECRET_KEY}"

# Cleaning then building is necessary to clean-up all previous built files
yarn build

## MacOS binaries
echo "Building MacOS binaries..."
yarn oclif-dev pack:macos

echo "Publishing MacOS binaries..."
# Needs: AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY
# Useless to test if AWS_* exists, AWS sdk requires it and will checks them

yarn oclif-dev publish:macos
