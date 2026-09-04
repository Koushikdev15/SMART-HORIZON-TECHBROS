#!/usr/bin/env bash
# Tears the network down completely — containers, volumes, and generated
# crypto/channel material. Run generate-crypto.sh + network-up.sh again to
# start fresh (a fresh crypto-config also means a fresh channel; there is no
# partial-reset path, by design — matches Fabric's own test-network).
set -euo pipefail
cd "$(dirname "$0")/.."

docker compose -f docker-compose.yaml down -v --remove-orphans
rm -rf crypto-config channel-artifacts ayurtrace-chaincode.tar.gz
echo "Network down. All containers, volumes and generated crypto/channel material removed."
