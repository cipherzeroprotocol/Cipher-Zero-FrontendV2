import { Connection } from "@solana/web3.js";

export const rpcUrl = "https://api.devnet.solana.com";

export const getConnection = () => {
  const connection = new Connection(rpcUrl, "confirmed");
  return connection;
};
