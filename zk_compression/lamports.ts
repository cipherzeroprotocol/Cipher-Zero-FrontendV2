import { ComputeBudgetProgram, Keypair, PublicKey, TransactionInstruction } from '@solana/web3.js';
import { buildAndSignTx, LightSystemProgram } from '@lightprotocol/stateless.js';
import {CompressedData } from '../types';


export async function createCompressInstruction(data: Buffer, toAddress: PublicKey): Promise<TransactionInstruction> {
    return LightSystemProgram.compress({
        payer: toAddress,
        lamports: data.length,
        toAddress,
        outputStateTree: new PublicKey(data),
    });
}

async function main() {
    const fromKeypair = Keypair.generate(); // Replace with your actual keypair
    const blockhash = await getRecentBlockhash(); // Replace with your method to get the recent blockhash
    const dataToCompress = Buffer.from('example data'); // Replace with your actual data

    // Create the compress instruction
    const compressInstruction = await createCompressInstruction(dataToCompress, fromKeypair.publicKey);

    // Build and sign the transaction
    const transaction = buildAndSignTx(
        [await ComputeBudgetProgram.setComputeUnitLimit({ units: 1_200_000 }), compressInstruction],
        fromKeypair,
        blockhash,
        []
    );

    console.log('Transaction:', transaction);
}

// Replace with your actual method to get the recent blockhash
async function getRecentBlockhash(): Promise<string> {
    // Implement your logic to get the recent blockhash
    return 'exampleBlockhash';
}

main().catch(console.error);