#!/bin/bash

set -e

AWS_S3_ENDPOINT="https://s3.fr-par.scw.cloud"
export AWS_S3_ENDPOINT

# Cleaning then building is necessary to clean-up all previous built files
yarn build

## Windows binaries
echo "Building Windows binaries..."
# Needs: `nsis` package
yarn oclif-dev pack:win

echo "Publishing Windows binaries..."
# Needs: AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY
# Useless to test AWS_*, AWS sdk requires it
yarn oclif-dev publish:win

# Cleaning then building is necessary to clean-up all previous built files
yarn build

## Standalone tarballs

echo "Building standalone tarballs..."
yarn oclif-dev pack

echo "Publishing standalone tarballs..."
# Needs: AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY
# Useless to test AWS_*, AWS sdk requires it
yarn oclif-dev publish

