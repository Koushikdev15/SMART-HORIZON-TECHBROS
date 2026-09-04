#!/usr/bin/env bash
# Generates MSP/TLS material for all four orgs from crypto-config.yaml, and
# the channel genesis block + anchor-peer updates from configtx.yaml.
# Requires the Fabric binaries (cryptogen, configtxgen) on PATH — see
# herbchain_fabric/README.md for how to install them.
set -euo pipefail
cd "$(dirname "$0")/.."

rm -rf crypto-config channel-artifacts
mkdir -p channel-artifacts

echo "== Generating crypto material (cryptogen) =="
cryptogen generate --config=./crypto-config.yaml --output="crypto-config"

export FABRIC_CFG_PATH="$PWD"

echo "== Generating channel genesis block (channel-participation API, no system channel) =="
configtxgen -profile AyurTraceChannel -channelID ayurtrace-channel \
  -outputBlock ./channel-artifacts/ayurtrace-channel.block

for org in CollectionOrgMSP LaboratoryOrgMSP ManufacturerOrgMSP; do
  configtxgen -profile AyurTraceChannel -channelID ayurtrace-channel \
    -outputAnchorPeersUpdate "./channel-artifacts/${org}anchors.tx" -asOrg "$org"
done

echo "Done. Crypto material in ./crypto-config, channel artifacts in ./channel-artifacts."
