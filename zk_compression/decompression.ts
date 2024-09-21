import { 
  Rpc, 
  LightSystemProgram,
  createRpc,
  CompressedAccountWithMerkleContext
} from "@lightprotocol/stateless.js";
import { Connection, PublicKey, TransactionInstruction } from '@solana/web3.js';
import { ProofData, PublicSignals, CompressedData } from '../types';
import { logger } from '../utils/logger';
import { BitTorrentManager } from '../bittorrent/torrent_manager';
import { RPC_ENDPOINT } from '../utils/constants';

interface CompressedFileData {
  proof: ProofData;
  publicSignals: PublicSignals;
  compressedData: CompressedData;
}

interface LocalTorrentInfo {
  infoHash: string;
  pieceLength: number;
}

class DecompressionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DecompressionError';
  }
}

class ProofVerificationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ProofVerificationError';
  }
}

export class Decompressor {
  private lightRpc: Rpc;
  private solanaConnection: Connection;
  private bitTorrentManager: BitTorrentManager;

  constructor(solanaConnection: Connection, bitTorrentManager: BitTorrentManager) {
    this.lightRpc = createRpc(RPC_ENDPOINT);
    this.solanaConnection = solanaConnection;
    this.bitTorrentManager = bitTorrentManager;
  }

  async initialize(): Promise<void> {
    logger.info('Initializing Decompressor...');
    try {
      await this.bitTorrentManager.initialize();
      logger.info('Decompressor initialized successfully');
    } catch (error: unknown) {
      logger.error('Failed to initialize Decompressor:', error);
      throw error instanceof Error ? error : new Error('Unknown error during initialization');
    }
  }

  async retrieveAndDecompress(dataHash: string): Promise<Buffer> {
    logger.info(`Retrieving and decompressing data with hash: ${dataHash}`);

    try {
      const compressedFileData = await this.retrieveCompressedFile(dataHash);
      await this.verifyProof(compressedFileData.proof, compressedFileData.publicSignals, dataHash);
      
      const torrentInfo = await this.retrieveTorrentInfoFromSolana(dataHash);
      const compressedData = await this.bitTorrentManager.download(torrentInfo.infoHash);
      
      return this.decompress(compressedData);
    } catch (error: unknown) {
      logger.error(`Failed to retrieve and decompress data with hash ${dataHash}:`, error);
      throw error instanceof Error ? error : new Error('Unknown error during retrieval and decompression');
    }
  }

  private async retrieveCompressedFile(dataHash: string): Promise<CompressedFileData> {
    try {
      // Implement the logic to retrieve compressed file data
      // This is a placeholder and needs to be replaced with actual implementation
      const compressedData = await this.lightRpc.getAccountInfo(new PublicKey(dataHash));
      if (!compressedData) {
        throw new Error('Compressed data not found');
      }
      return {
        proof: {} as ProofData, // placeholder
        publicSignals: {} as PublicSignals, // placeholder
        compressedData: compressedData.data as unknown as CompressedData
      };
    } catch (error: unknown) {
      logger.error(`Failed to retrieve compressed file with hash ${dataHash}:`, error);
      throw error instanceof Error ? error : new Error('Failed to retrieve compressed file: Unknown error');
    }
  }

  private async retrieveTorrentInfoFromSolana(dataHash: string): Promise<LocalTorrentInfo> {
    try {
      const SOLANA_PROGRAM_ID = 'YourSolanaProgramIdHere'; // Replace with the actual program ID
      const programId = new PublicKey(SOLANA_PROGRAM_ID);
      const [metadataAccount] = await PublicKey.findProgramAddress(
        [Buffer.from('metadata'), Buffer.from(dataHash)],
        programId
      );

      const accountInfo = await this.solanaConnection.getAccountInfo(metadataAccount);
      if (!accountInfo) {
        throw new Error('Metadata account not found');
      }

      return deserializeTorrentInfo(accountInfo.data);
    } catch (error: unknown) {
      logger.error(`Failed to retrieve torrent info from Solana for hash ${dataHash}:`, error);
      throw error instanceof Error ? error : new Error('Failed to retrieve torrent info: Unknown error');
    }
  }

  private async verifyProof(proof: ProofData, publicSignals: PublicSignals, dataHash: string): Promise<void> {
    logger.debug('Verifying proof...');
    try {
      // Implement your own proof verification logic here
      // This is a placeholder and needs to be replaced with actual implementation
      const isValid = true; // Replace with actual verification
      if (!isValid) {
        throw new ProofVerificationError('Invalid proof');
      }
      logger.debug('Proof verified successfully');
    } catch (error: unknown) {
      logger.error('Proof verification failed:', error);
      throw error instanceof Error ? error : new Error('Proof verification failed: Unknown error');
    }
  }

  private async decompress(compressedData: CompressedData): Promise<Buffer> {
    logger.debug(`Decompressing data`);
    try {
      const decompressInstruction = await LightSystemProgram.decompress({
        inputCompressedAccounts: [{
          ...compressedData,
          owner: PublicKey.default,
          lamports: 0,
          address: PublicKey.default
        } as unknown as CompressedAccountWithMerkleContext],
        connection: this.lightRpc,
      });
      
      // Extract the actual data from the instruction
      // This is a simplified example and may need to be adjusted based on the actual structure of the instruction
      const decompressedData = decompressInstruction.data;
      
      logger.debug(`Data decompressed to ${decompressedData.length} bytes`);
      return Buffer.from(decompressedData);
    } catch (error: unknown) {
      logger.error('Decompression failed:', error);
      throw new DecompressionError(`Failed to decompress data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async cleanup(): Promise<void> {
    logger.info('Cleaning up Decompressor...');
    await this.bitTorrentManager.cleanup();
  }
}

function deserializeTorrentInfo(data: Buffer): LocalTorrentInfo {
  return {
    infoHash: data.slice(0, 20).toString('hex'),
    pieceLength: data.readUInt32LE(20),
  };
}

export function createDecompressor(solanaConnection: Connection, bitTorrentManager: BitTorrentManager): Decompressor {
  return new Decompressor(solanaConnection, bitTorrentManager);
}