import {
  LightSystemProgram,
  Rpc,
  bn,
  buildAndSignTx,
  compress,
  confirmTx,
  createRpc,
  decompress,
  defaultTestStateTreeAccounts,
  selectMinCompressedSolAccountsForTransfer,
  sendAndConfirmTx,
} from "@lightprotocol/stateless.js";
import { createMint, mintTo, transfer } from "@lightprotocol/compressed-token";
import { ComputeBudgetProgram, Keypair, PublicKey } from "@solana/web3.js";

// Generate necessary keypairs for the payer and recipients
const payer = Keypair.generate();
const tokenRecipient = Keypair.generate();
const lamportsRecipient = Keypair.generate();

// Initialize the connection to the RPC endpoint
const connection: Rpc = createRpc();

/**
* Main function to execute the example transactions.
*/
async function main(): Promise<void> {
  try {
      // Airdrop SOL to payer, lamportsRecipient, and tokenRecipient
      await airdropToAccounts();

      // Emit events for SOL compression and transfer
      await emitSolEvents();

      // Emit events for token minting, transfer, and re-transfer
      await emitTokenEvents();

      // Additional RPC methods can be used here to interact with zk compressed state
      // Examples are provided as comments for further exploration.
  } catch (error) {
      console.error("Error in main execution:", error);
  }
}

/**
* Airdrops SOL to the specified accounts.
*/
async function airdropToAccounts(): Promise<void> {
  try {
      const airdropPromises = [
          confirmTx(connection, await connection.requestAirdrop(payer.publicKey, 10e9)),
          confirmTx(connection, await connection.requestAirdrop(lamportsRecipient.publicKey, 10e9)),
          confirmTx(connection, await connection.requestAirdrop(tokenRecipient.publicKey, 10e9)),
      ];
      await Promise.all(airdropPromises);
      console.log("Airdrop successful to all accounts.");
  } catch (error) {
      console.error("Airdrop failed:", error);
      throw new Error("Airdrop transaction failed.");
  }
}

/**
* Emits SOL-related events by compressing, transferring, and decompressing lamports.
*/
async function emitSolEvents(): Promise<void> {
  try {
      await compress(connection, payer, 1e9, payer.publicKey);
      console.log("Compressed 1e9 lamports to payer's account.");

      await transferLamports(payer, 4e8, lamportsRecipient.publicKey);
      console.log("Transferred 4e8 lamports to lamportsRecipient.");

      await decompress(connection, lamportsRecipient, 3e8, lamportsRecipient.publicKey);
      console.log("Decompressed 3e8 lamports to lamportsRecipient's account.");
  } catch (error) {
      console.error("Error in SOL events:", error);
      throw new Error("SOL event emission failed.");
  }
}

/**
* Emits token-related events by creating a mint, minting tokens, and transferring them.
*/
async function emitTokenEvents(): Promise<void> {
  try {
      const { mint, transactionSignature } = await createMint(connection, payer, payer.publicKey, 9);
      console.log("Created new mint with transaction signature:", transactionSignature);

      const mintToTxId = await mintTo(connection, payer, mint, payer.publicKey, payer, 1e9);
      console.log("Minted 1e9 tokens to payer's account. Transaction ID:", mintToTxId);

      const transferTxId1 = await transfer(connection, payer, mint, 7e8, payer, tokenRecipient.publicKey);
      console.log("Transferred 7e8 tokens to tokenRecipient. Transaction ID:", transferTxId1);

      const transferTxId2 = await transfer(connection, tokenRecipient, mint, 6e8, tokenRecipient, payer.publicKey);
      console.log("Transferred 6e8 tokens back to payer. Transaction ID:", transferTxId2);
  } catch (error) {
      console.error("Error in token events:", error);
      throw new Error("Token event emission failed.");
  }
}

/**
* Transfers a specified amount of lamports from one account to another using zk compression.
* @param owner - The Keypair of the owner of the lamports.
* @param lamports - The amount of lamports to transfer.
* @param toAddress - The PublicKey of the recipient.
* @returns A promise that resolves to the transaction ID of the transfer.
*/
async function transferLamports(
  owner: Keypair,
  lamports: number,
  toAddress: PublicKey
): Promise<string> {
  try {
      // Get the compressed accounts owned by the payer
      const compressedAccounts = (await connection.getCompressedAccountsByOwner(owner.publicKey)).items;

      // Select the minimum set of compressed accounts needed for the transfer
      const [inputAccounts] = selectMinCompressedSolAccountsForTransfer(compressedAccounts, lamports);

      // Get the validity proof for the selected accounts
      const proof = await connection.getValidityProof(inputAccounts.map((account) => bn(account.hash)));

      // Create the transfer instruction
      const transferInstruction = await LightSystemProgram.transfer({
          payer: payer.publicKey,
          inputCompressedAccounts: inputAccounts,
          toAddress,
          lamports,
          recentInputStateRootIndices: proof.rootIndices,
          recentValidityProof: proof.compressedProof,
          outputStateTrees: defaultTestStateTreeAccounts().merkleTree,
      });

      // Get the latest blockhash and sign the transaction
      const { blockhash } = await connection.getLatestBlockhash();
      const signedTx = buildAndSignTx(
          [ComputeBudgetProgram.setComputeUnitLimit({ units: 1_000_000 }), transferInstruction],
          payer,
          blockhash
      );

      // Send and confirm the transaction
      const txId = await sendAndConfirmTx(connection, signedTx);
      console.log("Transfer lamports transaction ID:", txId);
      return txId;
  } catch (error) {
      console.error("Error transferring lamports:", error);
      throw new Error("Lamports transfer failed.");
  }
}

// Run the main function
main();
