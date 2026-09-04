import 'dotenv/config';

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var ${name} — see .env.example`);
  return value;
}

export const config = {
  port: Number(process.env.PORT ?? 4400),
  webhookSharedSecret: required('WEBHOOK_SHARED_SECRET'),

  supabaseUrl: required('SUPABASE_URL'),
  supabaseServiceRoleKey: required('SUPABASE_SERVICE_ROLE_KEY'),

  fabric: {
    channelName: process.env.FABRIC_CHANNEL_NAME ?? 'ayurtrace-channel',
    chaincodeName: process.env.FABRIC_CHAINCODE_NAME ?? 'ayurtrace-chaincode',
    mspId: required('FABRIC_MSP_ID'),
    peerEndpoint: required('FABRIC_PEER_ENDPOINT'),
    peerHostAlias: required('FABRIC_PEER_HOST_ALIAS'),
    tlsCertPath: required('FABRIC_TLS_CERT_PATH'),
    certPath: required('FABRIC_CERT_PATH'),
    keyDirPath: required('FABRIC_KEY_DIR_PATH'),
  },
} as const;
