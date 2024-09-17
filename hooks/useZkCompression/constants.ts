const rpcBaseUrl = process.env.NEXT_PUBLIC_RPC_BASE_URL;
const rpcApiKey = process.env.NEXT_PUBLIC_RPC_API_KEY;

const RPC_ENDPOINT = `${rpcBaseUrl}=${rpcApiKey}`;

const ZK_COMPRESSION_PROGRAM_ID = "SySTEM1eSU2p4BGQfQpimFEWWSC1XDFeun3Nqzz3rT7";

export { RPC_ENDPOINT, ZK_COMPRESSION_PROGRAM_ID };
