#!/usr/bin/env bash
# Packages, installs, approves and commits ayurtrace-chaincode on all three
# orgs. Run network-up.sh first, and `npm run build` inside
# herbchain_fabric/chaincode/ayurtrace-chaincode first (this packages the
# compiled dist/, not the TypeScript source — Fabric's Node chaincode runtime
# runs compiled JS).
set -euo pipefail
cd "$(dirname "$0")/.."
export FABRIC_CFG_PATH="$PWD"

CC_NAME="ayurtrace-chaincode"
CC_VERSION="1.0"
CC_SEQUENCE="1"
CC_PATH="../chaincode/ayurtrace-chaincode"
ORDERER_CA="$PWD/crypto-config/ordererOrganizations/orderer.ayurtrace.com/orderers/orderer1.orderer.ayurtrace.com/tls/ca.crt"
ORDERER_ADDR="localhost:7050"

set_org() {
  case "$1" in
    collection)
      export CORE_PEER_LOCALMSPID=CollectionOrgMSP
      export CORE_PEER_ADDRESS=localhost:7051
      export CORE_PEER_MSPCONFIGPATH="$PWD/crypto-config/peerOrganizations/collection.ayurtrace.com/users/Admin@collection.ayurtrace.com/msp"
      export CORE_PEER_TLS_ROOTCERT_FILE="$PWD/crypto-config/peerOrganizations/collection.ayurtrace.com/peers/peer0.collection.ayurtrace.com/tls/ca.crt"
      ;;
    laboratory)
      export CORE_PEER_LOCALMSPID=LaboratoryOrgMSP
      export CORE_PEER_ADDRESS=localhost:9051
      export CORE_PEER_MSPCONFIGPATH="$PWD/crypto-config/peerOrganizations/laboratory.ayurtrace.com/users/Admin@laboratory.ayurtrace.com/msp"
      export CORE_PEER_TLS_ROOTCERT_FILE="$PWD/crypto-config/peerOrganizations/laboratory.ayurtrace.com/peers/peer0.laboratory.ayurtrace.com/tls/ca.crt"
      ;;
    manufacturer)
      export CORE_PEER_LOCALMSPID=ManufacturerOrgMSP
      export CORE_PEER_ADDRESS=localhost:11051
      export CORE_PEER_MSPCONFIGPATH="$PWD/crypto-config/peerOrganizations/manufacturer.ayurtrace.com/users/Admin@manufacturer.ayurtrace.com/msp"
      export CORE_PEER_TLS_ROOTCERT_FILE="$PWD/crypto-config/peerOrganizations/manufacturer.ayurtrace.com/peers/peer0.manufacturer.ayurtrace.com/tls/ca.crt"
      ;;
  esac
  export CORE_PEER_TLS_ENABLED=true
}

echo "== Packaging chaincode =="
set_org collection
peer lifecycle chaincode package "${CC_NAME}.tar.gz" \
  --path "$CC_PATH" --lang node --label "${CC_NAME}_${CC_VERSION}"

PACKAGE_ID=""

for org in collection laboratory manufacturer; do
  echo "== [$org] Installing chaincode package =="
  set_org "$org"
  peer lifecycle chaincode install "${CC_NAME}.tar.gz"
done

set_org collection
PACKAGE_ID=$(peer lifecycle chaincode queryinstalled --output json \
  | grep -o "\"package_id\": *\"${CC_NAME}_${CC_VERSION}:[a-f0-9]*\"" | head -1 \
  | sed 's/"package_id": *"//;s/"//')
echo "Resolved PACKAGE_ID=$PACKAGE_ID"

for org in collection laboratory manufacturer; do
  echo "== [$org] Approving chaincode definition =="
  set_org "$org"
  peer lifecycle chaincode approveformyorg \
    -o "$ORDERER_ADDR" --tls --cafile "$ORDERER_CA" \
    --channelID ayurtrace-channel --name "$CC_NAME" \
    --version "$CC_VERSION" --package-id "$PACKAGE_ID" \
    --sequence "$CC_SEQUENCE"
done

echo "== Checking commit readiness =="
set_org collection
peer lifecycle chaincode checkcommitreadiness \
  --channelID ayurtrace-channel --name "$CC_NAME" \
  --version "$CC_VERSION" --sequence "$CC_SEQUENCE" --output json

echo "== Committing chaincode definition =="
peer lifecycle chaincode commit \
  -o "$ORDERER_ADDR" --tls --cafile "$ORDERER_CA" \
  --channelID ayurtrace-channel --name "$CC_NAME" \
  --version "$CC_VERSION" --sequence "$CC_SEQUENCE" \
  --peerAddresses localhost:7051 --tlsRootCertFiles "$PWD/crypto-config/peerOrganizations/collection.ayurtrace.com/peers/peer0.collection.ayurtrace.com/tls/ca.crt" \
  --peerAddresses localhost:9051 --tlsRootCertFiles "$PWD/crypto-config/peerOrganizations/laboratory.ayurtrace.com/peers/peer0.laboratory.ayurtrace.com/tls/ca.crt" \
  --peerAddresses localhost:11051 --tlsRootCertFiles "$PWD/crypto-config/peerOrganizations/manufacturer.ayurtrace.com/peers/peer0.manufacturer.ayurtrace.com/tls/ca.crt"

echo "== ayurtrace-chaincode committed on ayurtrace-channel. Smoke-testing GetProvenance on a nonexistent batch =="
peer chaincode query -C ayurtrace-channel -n "$CC_NAME" \
  -c '{"function":"GetProvenance","Args":["SMOKE-TEST-BATCH"]}'
echo "(An empty array [] above means the chaincode is live and responding — not an error.)"
