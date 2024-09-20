import dotenv from "dotenv";
dotenv.config();

export const RPC_ENDPOINT = `${process.env.RPC_ENDPOINT}`;
// add rpc api key
export const CIPHER_ZERO_PROGRAM_ID = 'YourProgramIdHere';

export const NETWORK_CONFIG = {

    baseUrl: 'https://api.mainnet-beta.solana.com',
  
    timeout: 30000,
  
    expectedCluster: 'mainnet-beta', // Add the expectedCluster property
  
  };
  



export const MAX_RETRIES = 3;

export const RETRY_DELAY = 1000; // in milliseconds

export const SOLANA_CLUSTER = 'devnet';

export const CONTRACT_ADDRESS = 'YourContractAddressHere';

export const RPC_URL = 'https://rpc.example.com';

export const SOLANA_RPC_URL = 'https://solana.rpc.example.com';

export const SOLANA_NETWORK = 'devnet';

export const ZK_COMPRESSION_PROGRAM_ID = 'YourProgramIdHere' ;