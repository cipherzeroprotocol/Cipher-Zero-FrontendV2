import dotenv from "dotenv";
import {
  LightSystemProgram,
  buildAndSignTx,
  createRpc,
  defaultTestStateTreeAccounts,
  sendAndConfirmTx,
  confirmTx,
} from "@lightprotocol/stateless.js";
import { ComputeBudgetProgram, Keypair } from "@solana/web3.js";

dotenv.config();

const fromKeypair = Keypair.generate();

// Set up connection to Solana network
const connection = createRpc();  // Localnet by default; adjust for other networks as needed

(async () => {
  try {
    // Airdrop lamports to cover transaction fees
    await confirmTx(connection, await connection.requestAirdrop(fromKeypair.publicKey, 10e9));

    // Fetch the latest blockhash
    const { blockhash } = await connection.getLatestBlockhash();

    // Create instruction to compress lamports to self
    const compressInstruction = LightSystemProgram.compress({
      payer: fromKeypair.publicKey,
      toAddress: fromKeypair.publicKey,
      lamports: 1_000_000_000,
      outputStateTree: defaultTestStateTreeAccounts().merkleTree,
    });

    // Build and sign the transaction with a compute budget program to increase unit limit
    const transaction = buildAndSignTx(
      [ComputeBudgetProgram.setComputeUnitLimit({ units: 1_200_000 }), compressInstruction],
      fromKeypair,
      blockhash
    );

    // Send the transaction and confirm its success
    const transactionId = await sendAndConfirmTx(connection, transaction);
    console.log("Transaction Signature:", transactionId);
  } catch (error) {
    console.error("Error during transaction:", error);
  }
})();
