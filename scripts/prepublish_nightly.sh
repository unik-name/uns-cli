#!/bin/bash

set -ex

echo "Upgrade @uns/ts-sdk dependency."
sdk_version=$(grep '"@uns/ts-sdk":' package.json | cut -d\" -f4)
yarn remove @uns/ts-sdk
yarn add @uns/ts-sdk@$sdk_version
