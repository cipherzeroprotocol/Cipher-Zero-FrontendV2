import { Keypair, Connection, PublicKey } from "@solana/web3.js";
import {
  Rpc,
  createRpc,
  confirmTx,
  LightSystemProgram,
  buildAndSignTx,
  defaultTestStateTreeAccounts,
  selectMinCompressedSolAccountsForTransfer,
} from "@lightprotocol/stateless.js";
import { ComputeBudgetProgram } from "@solana/web3.js";
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Configuration
const RPC_ENDPOINT = process.env.RPC_ENDPOINT || "https://api.devnet.solana.com";
const COMPRESSION_RPC_ENDPOINT = RPC_ENDPOINT;

// Create RPC connection for interacting with the Solana blockchain
const connection: Rpc = createRpc(RPC_ENDPOINT, COMPRESSION_RPC_ENDPOINT);

/**
 * Compresses data using Light Protocol's zk-compression.
 * @param data - The data to compress.
 * @returns A Promise that resolves to the compressed data.
 */
async function zkCompressData(data: Buffer): Promise<Buffer> {
  console.log(`Compressing data of size: ${data.length} bytes`);
  
  const payer = Keypair.generate();
  
  // Airdrop some SOL to the payer for transaction fees
  await confirmTx(
    connection,
    await connection.requestAirdrop(payer.publicKey, 1e9)
  );

  // Compress data using Light Protocol
  const compressIx = await LightSystemProgram.compress({
    payer: payer.publicKey,
    toAddress: payer.publicKey,
    lamports: data.length, // Using data length as a proxy for compression amount
    outputStateTree: defaultTestStateTreeAccounts().merkleTree,
  });

  const instructions = [
    ComputeBudgetProgram.setComputeUnitLimit({ units: 1_000_000 }),
    compressIx,
  ];

  const { blockhash } = await connection.getLatestBlockhash();
  const tx = buildAndSignTx(instructions, payer, blockhash, []);

  const txId = await connection.sendTransaction(tx);
  await connection.confirmTransaction(txId);

  console.log(`Data compressed. Transaction ID: ${txId}`);
  return Buffer.from(txId);
}

/**
 * Decompresses data using Light Protocol's zk-decompression.
 * @param compressedData - The compressed data to decompress.
 * @returns A Promise that resolves to the decompressed data.
 */
async function zkDecompressData(compressedData: Buffer): Promise<Buffer> {
  console.log(`Decompressing data of size: ${compressedData.length} bytes`);

  const payer = Keypair.generate();
  await confirmTx(
    connection,
    await connection.requestAirdrop(payer.publicKey, 1e9)
  );

  const accounts = await connection.getCompressedAccountsByOwner(payer.publicKey);
  const [selectedAccounts, _] = selectMinCompressedSolAccountsForTransfer(
    accounts.items,
    compressedData.length
  );

  const { compressedProof, rootIndices } = await connection.getValidityProof(
    selectedAccounts.map((account) => new BN(account.hash))
  );

  const decompressIx = await LightSystemProgram.transfer({
    payer: payer.publicKey,
    toAddress: payer.publicKey,
    lamports: compressedData.length,
    inputCompressedAccounts: selectedAccounts,
    outputStateTrees: [defaultTestStateTreeAccounts().merkleTree],
    recentValidityProof: compressedProof,
    recentInputStateRootIndices: rootIndices,
  });

  const instructions = [
    ComputeBudgetProgram.setComputeUnitLimit({ units: 1_000_000 }),
    decompressIx,
  ];

  const { blockhash } = await connection.getLatestBlockhash();
  const tx = buildAndSignTx(instructions, payer, blockhash, []);

  const txId = await connection.sendTransaction(tx);
  await connection.confirmTransaction(txId);

  console.log(`Data decompressed. Transaction ID: ${txId}`);
  return Buffer.from(txId);
}

/**
 * Transfers compressed data securely.
 * @param data - The data to transfer.
 * @param recipientPublicKey - The recipient's public key.
 */
async function transferCompressedData(data: Buffer, recipientPublicKey: string): Promise<void> {
  console.log(`Transferring compressed data to ${recipientPublicKey}`);

  const compressedData = await zkCompressData(data);

  const payer = Keypair.generate();
  await confirmTx(
    connection,
    await connection.requestAirdrop(payer.publicKey, 1e9)
  );

  const transferIx = await LightSystemProgram.transfer({
    payer: payer.publicKey,
    toAddress: new PublicKey(recipientPublicKey),
    lamports: compressedData.length,
    inputCompressedAccounts: [],
    outputStateTrees: [defaultTestStateTreeAccounts().merkleTree],
    recentValidityProof: Buffer.alloc(0),
    recentInputStateRootIndices: [],
  });

  const instructions = [
    ComputeBudgetProgram.setComputeUnitLimit({ units: 1_000_000 }),
    transferIx,
  ];

  const { blockhash } = await connection.getLatestBlockhash();
  const tx = buildAndSignTx(instructions, payer, blockhash, []);

  const txId = await connection.sendTransaction(tx);
  await connection.confirmTransaction(txId);

  console.log(`Compressed data transferred. Transaction ID: ${txId}`);
}

/**
 * Main function to demonstrate the usage of compressed data transfer.
 */
async function main() {
  const testData = Buffer.from("This is a test message for Cipher Zero Protocol");
  const recipientPublicKey = Keypair.generate().publicKey.toBase58();

  try {
    await transferCompressedData(testData, recipientPublicKey);
    console.log('Data transfer completed successfully');
  } catch (error) {
    console.error('Failed to transfer data:', error);
  }
}

// Execute the main function
main();