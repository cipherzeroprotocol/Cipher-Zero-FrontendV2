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
import dotenv from "dotenv";
import { BN } from "bn.js";
import { CompressedData, compressedData } from "@/types";
import { CompressedAccountWithMerkleContext } from "@/types"; // Adjust the import path as necessary

// Example values for the compressedData object
const ownerPublicKey = new PublicKey("ExampleOwnerPublicKey");
const addressPublicKey = new PublicKey("ExampleAddressPublicKey");
const lamportsAmount = 1000000; // Example lamports amount

const compressedData: CompressedAccountWithMerkleContext = {
  owner: ownerPublicKey,
  lamports: lamportsAmount,
  address: addressPublicKey,
  // Add other necessary fields if required
};

console.log(compressedData);
dotenv.config();

const RPC_ENDPOINT =
  process.env.RPC_ENDPOINT || "https://api.devnet.solana.com";
const COMPRESSION_RPC_ENDPOINT = RPC_ENDPOINT;

const connection: Rpc = createRpc(RPC_ENDPOINT, COMPRESSION_RPC_ENDPOINT);
const payer = Keypair.generate();

async function initializePayer(): Promise<void> {
  await confirmTx(
    connection,
    await connection.requestAirdrop(payer.publicKey, 2e9)
  );
  console.log(
    `Payer initialized with public key: ${payer.publicKey.toBase58()}`
  );
}

async function zkCompressData(data: Buffer): Promise<CompressedData> {
  console.log(`Compressing data of size: ${data.length} bytes`);

  const compressIx = await LightSystemProgram.compress({
    payer: payer.publicKey,
    lamports: data.length, // Use data length as lamports
    toAddress: payer.publicKey, // Use payer as recipient
    outputStateTree: defaultTestStateTreeAccounts().merkleTree,
  });

  compressIx.data = data;

  const instructions = [
    ComputeBudgetProgram.setComputeUnitLimit({ units: 1_000_000 }),
    compressIx,
  ];

  const { blockhash } = await connection.getLatestBlockhash();
  const tx = buildAndSignTx(instructions, payer, blockhash, []);

  const txId = await connection.sendTransaction(tx);
  await connection.confirmTransaction(txId);

  console.log(`Data compressed. Transaction ID: ${txId}`);

  // Fetch the compressed data from the transaction
  const txInfo = await connection.getTransaction(txId);
  if (!txInfo || !txInfo.meta) {
    throw new Error("Failed to fetch transaction info");
  }

  // Assuming the compressed data is stored in the first account after the payer
  const compressedDataAccount = txInfo.transaction.message.accountKeys[1];
  const compressedData = await connection.getAccountInfo(compressedDataAccount);

  if (!compressedData) {
    throw new Error("Failed to fetch compressed data");
  }

  return compressedData.data as unknown as CompressedData;
}

async function zkDecompressData(
  compressedData: CompressedData
): Promise<Buffer> {
  console.log(`Decompressing data`);

  const decompressIx = await LightSystemProgram.decompress({
    payer: payer.publicKey,
    inputCompressedAccounts: [compressedData], // Pass compressed data as an array
    outputStateTree: defaultTestStateTreeAccounts().merkleTree,
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

  // Fetch the decompressed data from the transaction
  const txInfo = await connection.getTransaction(txId);
  if (!txInfo || !txInfo.meta) {
    throw new Error("Failed to fetch transaction info");
  }

  // Assuming the decompressed data is stored in the first account after the payer
  const decompressedDataAccount = txInfo.transaction.message.accountKeys[1];
  const decompressedData = await connection.getAccountInfo(
    decompressedDataAccount
  );

  if (!decompressedData) {
    throw new Error("Failed to fetch decompressed data");
  }

  return Buffer.from(decompressedData.data);
}

async function transferCompressedData(
  data: Buffer,
  recipientPublicKey: string
): Promise<void> {
  console.log(`Transferring compressed data to ${recipientPublicKey}`);

  const compressedData = await zkCompressData(data);

  const transferIx = await LightSystemProgram.transfer({
    payer: payer.publicKey,
    toAddress: new PublicKey(recipientPublicKey),
    //lamports: compressedData.length, // Use compressed data length as lamports
    inputCompressedAccounts: [compressedData], // Pass compressed data as an array
    outputStateTrees: [defaultTestStateTreeAccounts().merkleTree],
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

async function main() {
  const testData = Buffer.from(
    "This is a test message for Cipher Zero Protocol"
  );
  const recipientPublicKey = Keypair.generate().publicKey.toBase58();

  try {
    await initializePayer();
    await transferCompressedData(testData, recipientPublicKey);
    console.log("Data transfer completed successfully");

    // Test decompression
    const compressedData = await zkCompressData(testData);
    const decompressedData = await zkDecompressData(compressedData);
    console.log("Decompressed data:", decompressedData.toString());
    console.log("Decompression test completed successfully");
  } catch (error) {
    console.error("Failed to transfer or decompress data:", error);
  }
}

main();
