import { PublicKey, Transaction, TransactionInstruction } from '@solana/web3.js';
import { SolanaConnection } from './connection';
import { logger } from '../utils/logger';

import { CompressedData, CompressionType, ProofData, PublicSignals } from '../types';


class CipherZeroProgram {
  private programId: PublicKey;

  constructor(private connection: SolanaConnection, programId: string) {
    this.programId = new PublicKey(programId);
  }


  public async uploadCompressedFile(
    compressedData: Buffer,
    proof: ProofData,
    publicSignals: PublicSignals
  ): Promise<string | undefined> {
    try {
      const payer = await this.connection.getPayer();
      const instruction = new TransactionInstruction({
        keys: [
          { pubkey: payer.publicKey, isSigner: true, isWritable: true },
          // Add other necessary account keys here
        ],
        programId: this.programId,
        data: Buffer.from([
          0, // Instruction index for uploadCompressedFile
          ...Array.from(compressedData),
          ...Array.from(this.serializeProof(proof)),
          ...Array.from(this.serializePublicSignals(publicSignals))
        ])
      });

      const transaction = new Transaction().add(instruction);
      const signature = await this.connection.sendAndConfirmTransaction(transaction, [payer]);

      logger.info(`File uploaded successfully. Transaction signature: ${signature}`);
      return signature;
    } catch (error) {
      logger.error('Failed to upload compressed file:', error);
      
    return undefined;
}
}


  public async retrieveCompressedFile(dataHash: string): Promise<CompressedData> {
    try {
      const [fileAccount] = await PublicKey.findProgramAddress(
        [Buffer.from('file'), Buffer.from(dataHash)],
        this.programId
      );

      const accountInfo = await this.connection.getConnection().getAccountInfo(fileAccount);
      if (!accountInfo) {
        throw new Error('File account not found');
      }

      // Deserialize the account data based on your program's data structure
      const { compressedData, proof, publicSignals } = this.deserializeFileAccount(accountInfo.data);

      const retrievedDataHash = ''; // Replace with actual dataHash extraction logic
      const signature = ''; // Replace with actual signature extraction logic
      //const compressionType: CompressionType = CompressionType.GZIP; // Replace with actual compressionType extraction logic
      const originalSize = 0; // Replace with actual originalSize extraction logic
      const compressedSize = 0; // Replace with actual compressedSize extraction logic

      return { compressedData, proof, publicSignals, dataHash: retrievedDataHash, signature, originalSize, compressedSize };
    } catch (error) {
      logger.error(`Failed to retrieve compressed file with hash ${dataHash}:`, error);
      
    }
  }


  public async getFileCount(): Promise<number> {
    try {
      const [countAccount] = await PublicKey.findProgramAddress(
        [Buffer.from('file_count')],
        this.programId
      );

      const accountInfo = await this.connection.getConnection().getAccountInfo(countAccount);
      if (!accountInfo) {
        return 0;
      }

      // Assuming the count is stored as a 4-byte integer
      return accountInfo.data.readUInt32LE(0);
    } catch (error) {
      logger.error('Failed to get file count:', error);
      return 0;
    }
  }


  public async getFileHashByIndex(index: number): Promise<string | undefined> {
    try {
      const [indexAccount] = await PublicKey.findProgramAddress(
        [Buffer.from('file_index'), Buffer.from(index.toString())],
        this.programId
      );

      const accountInfo = await this.connection.getConnection().getAccountInfo(indexAccount);
      if (!accountInfo) {
        throw new Error('File index account not found');
      }

      // Assuming the hash is stored as a 32-byte array
      return Buffer.from(accountInfo.data).toString('hex');
    } catch (error) {
      logger.error(`Failed to get file hash for index ${index}:`, error);
      
    }
  }

  private serializeProof(proof: ProofData): Buffer {
    // Implement serialization logic for your ProofData structure
    // This is a placeholder implementation
    return Buffer.from(JSON.stringify(proof));
  }

  private serializePublicSignals(publicSignals: PublicSignals): Buffer {
    // Implement serialization logic for your PublicSignals structure
    // This is a placeholder implementation
    return Buffer.from(JSON.stringify(publicSignals));
  }

  private deserializeFileAccount(data: Buffer): CompressedData {
    // Implement deserialization logic based on your program's account data structure
    // This is a placeholder implementation
    const compressedData = data.slice(0, 100); // Adjust based on your data structure
    const proof = JSON.parse(data.slice(100, 200).toString()); // Adjust based on your data structure
    const publicSignals = JSON.parse(data.slice(200).toString()); // Adjust based on your data structure

    const dataHash = ''; // Replace with actual dataHash extraction logic
    const signature = ''; // Replace with actual signature extraction logic
    //const compressionType: CompressionType = 'gzip'; // Replace with actual compressionType extraction logic
    const originalSize = 0; // Replace with actual originalSize extraction logic
    const compressedSize = 0; // Replace with actual compressedSize extraction logic

    return { compressedData, proof, publicSignals, dataHash, signature,  originalSize, compressedSize };
  }
}

export async function createCipherZeroProgram(
  connection: SolanaConnection,
  programId: string
): Promise<CipherZeroProgram> {
  return new CipherZeroProgram(connection, programId);
}

export { CipherZeroProgram };