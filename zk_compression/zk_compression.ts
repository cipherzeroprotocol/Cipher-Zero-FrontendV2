import {
    LightSystemProgram,
    Rpc,
    confirmTx,
    createRpc,
} from "@lightprotocol/stateless.js";
import { createMint, mintTo, transfer } from "@lightprotocol/compressed-token";
import { Keypair, PublicKey } from "@solana/web3.js";

// Generate keypairs for the payer and token recipient
const payer = Keypair.generate();
const tokenRecipient = Keypair.generate();

// Create an RPC connection using environment variables
const connection: Rpc = createRpc(process.env.RPC_ENDPOINT!, process.env.COMPRESSION_RPC_ENDPOINT!);

/**
 * Airdrops lamports to the payer and token recipient for paying fees.
 * This function is typically used in test environments where free tokens are available.
 */
async function airdropLamports(): Promise<void> {
    await confirmTx(connection, await connection.requestAirdrop(payer.publicKey, 10e9)); // 10 SOL to payer
    await confirmTx(connection, await connection.requestAirdrop(tokenRecipient.publicKey, 1e6)); // 0.001 SOL to recipient
}

/**
 * Creates a new compressed token mint.
 * @returns A Promise that resolves to the base58-encoded mint address.
 */
async function createCompressedMint(): Promise<string> {
    const { mint, transactionSignature } = await createMint(
        connection,
        payer,
        payer.publicKey,
        9 // Number of decimals for the token
    );
    console.log(`Mint created with transaction: ${transactionSignature}`);
    return mint.toBase58();
}

/**
 * Mints compressed tokens to the payer's address.
 * @param mintAddress - The base58-encoded address of the token mint.
 */
async function mintCompressedTokens(mintAddress: string): Promise<void> {
    const mintToTxId = await mintTo(connection, payer, new PublicKey(mintAddress), payer.publicKey, payer, 1e9);
    console.log(`Minted tokens with transaction: ${mintToTxId}`);
}

/**
 * Transfers compressed tokens from the payer to the token recipient.
 * @param mintAddress - The base58-encoded address of the token mint.
 * @param amount - The amount of tokens to transfer.
 */
async function transferCompressedTokens(mintAddress: string, amount: number): Promise<void> {
    const transferTxId = await transfer(connection, payer, new PublicKey(mintAddress), amount, payer, tokenRecipient.publicKey);
    console.log(`Transferred tokens with transaction: ${transferTxId}`);
}

/**
 * Compresses data using ZK compression (simulated with token minting).
 * @param data - The data to compress.
 * @returns A Promise that resolves to the compressed data (mint address).
 */
export async function zkCompressData(data: string): Promise<string> {
    console.log(`Compressing data: ${data}`);
    try {
        const mintAddress = await createCompressedMint();
        await mintCompressedTokens(mintAddress);

        // Example usage of LightSystemProgram
        const lightSystemProgramId = LightSystemProgram.programId;
        console.log(`LightSystemProgram ID: ${lightSystemProgramId.toBase58()}`);

        console.log(`Data compressed: ${mintAddress}`);
        return mintAddress;
    } catch (error) {
        console.error('Error during ZK compression of data:', error);
        if (error instanceof Error) {
            throw new Error(`Failed to compress data: ${error.message}`);
        } else {
            throw new Error('Failed to compress data: Unknown error');
        }
    }
}

/**
 * Decompresses data (mock implementation).
 * @param compressedData - The compressed data to decompress.
 * @returns A Promise that resolves to the decompressed data.
 */
export async function decompressData(compressedData: string): Promise<string> {
    console.log(`Decompressing data: ${compressedData}`);
    try {
        // TODO: Implement real ZK proof verification here
        console.log(`Data decompressed: ${compressedData}`);
        return compressedData;
    } catch (error) {
        console.error('Error during decompression of data:', error);
        if (error instanceof Error) {
            throw new Error(`Failed to decompress data: ${error.message}`);
        } else {
            throw new Error('Failed to decompress data: Unknown error');
        }
    }
}

/**
 * Demonstrates the process of compressing and decompressing data.
 * @param data - The original data to compress and then decompress.
 */
async function compressAndDecompressData(data: string): Promise<void> {
    try {
        const compressed = await zkCompressData(data);
        console.log(`Original data compressed to: ${compressed}`);
        
        const decompressed = await decompressData(compressed);
        console.log(`Decompressed data: ${decompressed}`);
    } catch (error) {
        console.error('Error in compress and decompress process:', error);
    }
}

/**
 * Main function to orchestrate the entire process.
 * This function demonstrates the usage of various compression and token operations.
 */
const main = async () => {
    try {
        await airdropLamports();
        // Example: Compress and decompress data
        await compressAndDecompressData("example_data");
        
        // Example: Transfer compressed tokens
        // Note: Replace with actual mint address and amount in a real scenario
        await transferCompressedTokens("example_mint_address", 1e9);
    } catch (error) {
        console.error('Error in main function:', error);
    }
};

// Execute the main function
main();