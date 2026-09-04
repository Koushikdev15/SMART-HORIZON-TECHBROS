import * as grpc from '@grpc/grpc-js';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { createPrivateKey } from 'node:crypto';
import {
  connect,
  Gateway,
  Identity,
  Signer,
  signers,
  Contract,
  Network,
} from '@hyperledger/fabric-gateway';
import { config } from './config';

/**
 * A real Fabric Gateway connection — gRPC to a peer, mTLS client identity,
 * one Contract handle reused across requests. No mocking anywhere in this
 * file: if the peer/orderer aren't actually running, `connect()` and every
 * subsequent submit/evaluate call fails loudly, which is exactly what should
 * happen (see webhook.ts — a connection failure is recorded as
 * blockchain_status = 'FAILED', never silently swallowed into a fake success).
 */

let gatewaySingleton: Gateway | null = null;
let networkSingleton: Network | null = null;
let contractSingleton: Contract | null = null;
let grpcClient: grpc.Client | null = null;

async function loadFirstKeyInDir(dir: string): Promise<Buffer> {
  const files = await fs.readdir(dir);
  if (files.length === 0) throw new Error(`No private key found in ${dir}`);
  return fs.readFile(path.join(dir, files[0]));
}

async function newIdentity(): Promise<Identity> {
  const credentials = await fs.readFile(config.fabric.certPath);
  return { mspId: config.fabric.mspId, credentials };
}

async function newSigner(): Promise<Signer> {
  const keyPem = await loadFirstKeyInDir(config.fabric.keyDirPath);
  const privateKey = createPrivateKey(keyPem);
  return signers.newPrivateKeySigner(privateKey);
}

async function newGrpcClient(): Promise<grpc.Client> {
  const tlsRootCert = await fs.readFile(config.fabric.tlsCertPath);
  const credentials = grpc.credentials.createSsl(tlsRootCert);
  return new grpc.Client(config.fabric.peerEndpoint, credentials, {
    'grpc.ssl_target_name_override': config.fabric.peerHostAlias,
  });
}

/** Opens (or reuses) the gateway connection and returns the channel Network
 *  handle — the thing both our own contract and qscc (for raw transaction
 *  lookups) are obtained from. */
export async function getNetwork(): Promise<Network> {
  if (networkSingleton) return networkSingleton;

  grpcClient = await newGrpcClient();
  const identity = await newIdentity();
  const signer = await newSigner();

  gatewaySingleton = connect({
    client: grpcClient,
    identity,
    signer,
    // Generous timeouts: a PoC single-node orderer + CouchDB can be slow on
    // a laptop, especially on the first transaction after a cold start.
    evaluateOptions: () => ({ deadline: Date.now() + 10_000 }),
    endorseOptions: () => ({ deadline: Date.now() + 15_000 }),
    submitOptions: () => ({ deadline: Date.now() + 10_000 }),
    commitStatusOptions: () => ({ deadline: Date.now() + 30_000 }),
  });

  networkSingleton = gatewaySingleton.getNetwork(config.fabric.channelName);
  return networkSingleton;
}

/** The AyurTraceContract handle — what webhook.ts and the read routes use
 *  for everything except raw transaction-by-id lookups. */
export async function getContract(): Promise<Contract> {
  if (contractSingleton) return contractSingleton;
  const network = await getNetwork();
  contractSingleton = network.getContract(config.fabric.chaincodeName, 'AyurTraceContract');
  return contractSingleton;
}

export function closeFabricConnection(): void {
  gatewaySingleton?.close();
  grpcClient?.close();
  gatewaySingleton = null;
  networkSingleton = null;
  contractSingleton = null;
  grpcClient = null;
}

/**
 * Submits a transaction (a write — goes through endorsement + ordering) and
 * returns the REAL transaction ID Fabric assigned. This is the only place in
 * this whole system a "blockchain transaction id" is allowed to come from.
 */
export async function submitTransaction(fn: string, ...args: string[]): Promise<{ txId: string; result: string }> {
  const contract = await getContract();
  const proposal = contract.newProposal(fn, { arguments: args });
  const transaction = await proposal.endorse();
  const txId = transaction.getTransactionId();
  const commit = await transaction.submit();
  const status = await commit.getStatus();
  if (!status) {
    throw new Error(`Transaction ${txId} did not receive a valid commit status from the orderer.`);
  }
  return { txId, result: Buffer.from(transaction.getResult()).toString('utf8') };
}

/** A read (evaluate — no endorsement/ordering, queries one peer's world state). */
export async function evaluateTransaction(fn: string, ...args: string[]): Promise<string> {
  const contract = await getContract();
  const result = await contract.evaluateTransaction(fn, ...args);
  return Buffer.from(result).toString('utf8');
}
