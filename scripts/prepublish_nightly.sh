#!/bin/bash

set -e

sdk_version=$(grep '"@uns/ts-sdk":' package.json | cut -d\" -f4)

echo "Configured version of UNS SDK: ${sdk_version}"

echo "Upgrade @uns/ts-sdk dependency..."
yarn remove @uns/ts-sdk
yarn add @uns/ts-sdk@"${sdk_version}"
