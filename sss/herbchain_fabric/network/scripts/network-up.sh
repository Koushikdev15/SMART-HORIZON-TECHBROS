#!/usr/bin/env bash
# Brings up the AyurTrace+ Fabric network and joins all four nodes to
# ayurtrace-channel. Run generate-crypto.sh first. Requires docker,
# docker compose, and the Fabric `peer`/`osnadmin` binaries on PATH.
set -euo pipefail
cd "$(dirname "$0")/.."
export FABRIC_CFG_PATH="$PWD"
ORDERER_CA="$PWD/crypto-config/ordererOrganizations/orderer.ayurtrace.com/orderers/orderer1.orderer.ayurtrace.com/tls/ca.crt"
ORDERER_ADMIN_TLS_DIR="$PWD/crypto-config/ordererOrganizations/orderer.ayurtrace.com/orderers/orderer1.orderer.ayurtrace.com/tls"

echo "== docker compose up -d =="
docker compose -f docker-compose.yaml up -d

echo "== Waiting for the orderer's admin endpoint =="
for i in $(seq 1 20); do
  if curl -sk --cert "$ORDERER_ADMIN_TLS_DIR/server.crt" --key "$ORDERER_ADMIN_TLS_DIR/server.key" \
      --cacert "$ORDERER_CA" https://localhost:7053/participation/v1/channels >/dev/null 2>&1; then
    break
  fi
  sleep 2
done

echo "== Joining orderer1 to ayurtrace-channel (channel-participation API) =="
osnadmin channel join \
  --channelID ayurtrace-channel \
  --config-block ./channel-artifacts/ayurtrace-channel.block \
  -o localhost:7053 \
  --ca-file "$ORDERER_CA" \
  --client-cert "$ORDERER_ADMIN_TLS_DIR/server.crt" \
  --client-key "$ORDERER_ADMIN_TLS_DIR/server.key"

join_peer() {
  local org_msp="$1" peer_addr="$2" msp_dir="$3" tls_ca="$4"
  echo "== Joining $peer_addr =="
  for i in $(seq 1 10); do
    if CORE_PEER_TLS_ENABLED=true \
      CORE_PEER_LOCALMSPID="$org_msp" \
      CORE_PEER_MSPCONFIGPATH="$msp_dir" \
      CORE_PEER_TLS_ROOTCERT_FILE="$tls_ca" \
      CORE_PEER_ADDRESS="$peer_addr" \
      peer channel join -b ./channel-artifacts/ayurtrace-channel.block; then
      return 0
    fi
    echo "   ($peer_addr not ready yet, retrying in 3s...)"
    sleep 3
  done
  echo "ERROR: $peer_addr never became ready to join the channel" >&2
  return 1
}

join_peer CollectionOrgMSP localhost:7051 \
  "$PWD/crypto-config/peerOrganizations/collection.ayurtrace.com/users/Admin@collection.ayurtrace.com/msp" \
  "$PWD/crypto-config/peerOrganizations/collection.ayurtrace.com/peers/peer0.collection.ayurtrace.com/tls/ca.crt"

join_peer LaboratoryOrgMSP localhost:9051 \
  "$PWD/crypto-config/peerOrganizations/laboratory.ayurtrace.com/users/Admin@laboratory.ayurtrace.com/msp" \
  "$PWD/crypto-config/peerOrganizations/laboratory.ayurtrace.com/peers/peer0.laboratory.ayurtrace.com/tls/ca.crt"

join_peer ManufacturerOrgMSP localhost:11051 \
  "$PWD/crypto-config/peerOrganizations/manufacturer.ayurtrace.com/users/Admin@manufacturer.ayurtrace.com/msp" \
  "$PWD/crypto-config/peerOrganizations/manufacturer.ayurtrace.com/peers/peer0.manufacturer.ayurtrace.com/tls/ca.crt"

echo "== Network is up and all four nodes have joined ayurtrace-channel =="
echo "Next: ./scripts/deploy-chaincode.sh"
