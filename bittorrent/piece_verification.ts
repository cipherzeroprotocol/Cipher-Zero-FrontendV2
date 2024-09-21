import {  Connection } from '@solana/web3.js';
import { ZkUtils } from '../zk_compression/zk_utils';
import { logger } from '../utils/logger';
import {
    LightSystemProgram,
    Rpc,
    confirmTx,
    createRpc,
} from "@lightprotocol/stateless.js";
import { createMint, mintTo, transfer } from "@lightprotocol/compressed-token";
import { Keypair, PublicKey } from "@solana/web3.js";
import { sha256 } from 'ethers';

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
 * Verifies a piece of data using ZK compression (simulated with token minting).
 * @param data - The data to verify.
 * @returns A Promise that resolves to the verification result (mint address).
 */
export async function verifyPiece(data: string): Promise<string> {
    console.log(`Verifying piece of data: ${data}`);
    try {
        const mintAddress = await createCompressedMint();
        await mintCompressedTokens(mintAddress);

        // Example usage of LightSystemProgram
        const lightSystemProgramId = LightSystemProgram.programId;
        console.log(`LightSystemProgram ID: ${lightSystemProgramId.toBase58()}`);

        console.log(`Piece verified: ${mintAddress}`);
        return mintAddress;
    } catch (error) {
        console.error('Error during verification of piece:', error);
        if (error instanceof Error) {
            throw new Error(`Failed to verify piece: ${error.message}`);
        } else {
            throw new Error('Failed to verify piece: Unknown error');
        }
    }
}

/**
 * Main function to demonstrate piece verification.
 */
const main = async () => {
    try {
        await airdropLamports();
        // Example: Verify a piece of data
        await verifyPiece("example_piece_data");
    } catch (error) {
        console.error('Error in main function:', error);
    }
};

// Execute the main function
main();
export class PieceVerification {
    private zkUtils: ZkUtils;

    constructor(connection: Connection) {
        this.zkUtils = new ZkUtils(connection);
    }

    async verifyPiece(piece: Buffer, expectedHash: string, proof: any): Promise<boolean> {
        logger.debug('Verifying piece integrity and proof');

        // Verify the piece hash
        const pieceHash = sha256(piece);
        if (pieceHash.toString() !== expectedHash) {
            logger.warn('Piece hash mismatch');
            return false;
        }

        // Verify the zero-knowledge proof
        const isValidProof = await this.zkUtils.verifyZkProof(proof, { pieceHash: expectedHash }, 'piece_verification_key');
        if (!isValidProof) {
            logger.warn('Invalid zero-knowledge proof for piece');
            return false;
        }

        logger.info('Piece verified successfully');
        return true;
    }

    async generatePieceProof(piece: Buffer): Promise<any> {
        logger.debug('Generating proof for piece');
        const pieceHash = sha256(piece);
        const proof = await this.zkUtils.generateZkProof(piece, 'piece_circuit');
        return proof;
    }

    async verifyMerkleProof(piece: Buffer, merkleProof: any, merkleRoot: Buffer): Promise<boolean> {
        logger.debug('Verifying Merkle proof for piece');
        return this.zkUtils.verifyMerkleProof(merkleProof, merkleRoot, piece);
    }
}