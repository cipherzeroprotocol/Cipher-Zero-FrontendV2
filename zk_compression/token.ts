import dotenv from "dotenv";
import {
  LightSystemProgram,
  Rpc,
  confirmTx,
  createRpc,
} from "@lightprotocol/stateless.js"; // Changed from "@lightprotocol/stateless.js"
import { createMint, mintTo, transfer } from "@lightprotocol/compressed-token";
import { Keypair, PublicKey } from "@solana/web3.js";

dotenv.config();

// Keypairs for payer and recipient
const payer = Keypair.generate();
const tokenRecipient = Keypair.generate();

console.log("Payer Public Key:", payer.publicKey.toBase58());
console.log("Token Recipient Public Key:", tokenRecipient.publicKey.toBase58());

// Initialize connection to Solana network
const RPC_ENDPOINT = "https://devnet.helius-rpc.com?api-key=<api_key>";
const COMPRESSION_RPC_ENDPOINT = RPC_ENDPOINT;
const connection: Rpc = createRpc(RPC_ENDPOINT, COMPRESSION_RPC_ENDPOINT);

// Function to airdrop lamports to a specified keypair
const airdropLamports = async (keypair: Keypair, amount: number) => {
  const txId = await confirmTx(connection, await connection.requestAirdrop(keypair.publicKey, amount));
  console.log(`Airdrop Success! Transaction ID: ${txId}`);
};

// Function to create a mint for compressed tokens
const createMintToken = async () => {
  return await createMint(connection, payer, payer.publicKey, 9);
};

// Function to mint compressed tokens to a specified address
const mintCompressedTokens = async (mint: PublicKey, amount: number) => {
  return await mintTo(connection, payer, mint, payer.publicKey, payer, amount);
};

// Function to transfer compressed tokens to a specified recipient
const transferCompressedTokens = async (mint: PublicKey, amount: number) => {
  return await transfer(connection, payer, mint, amount, payer, tokenRecipient.publicKey);
};

const main = async () => {
  try {
    // Airdrop lamports to payer and token recipient
    await airdropLamports(payer, 10e9);
    await airdropLamports(tokenRecipient, 1e6);

    // Create and mint compressed-token
    const { mint, transactionSignature: createMintTxId } = await createMintToken();
    console.log(`Create Mint Success! Transaction ID: ${createMintTxId}`);

    const mintToTxId = await mintCompressedTokens(mint, 1e9);
    console.log(`Mint Tokens Success! Transaction ID: ${mintToTxId}`);

    const transferTxId = await transferCompressedTokens(mint, 7e8);
    console.log(`Transfer Tokens Success! Transaction ID: ${transferTxId}`);
  } catch (error) {
    console.error("Error during token operations:", error);
  }
};

// Run the main function
main();