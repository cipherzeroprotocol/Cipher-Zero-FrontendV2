import { groth16 } from 'snarkjs';
import { ethers } from 'ethers';
import { Connection, PublicKey } from '@solana/web3.js';
import { NeonConnection } from '../neon_evm/connection';
import { retrieveCompressedFile } from '../solana/contract_interactions';
import { CompressedFileData, ProofData, PublicSignals, TorrentInfo } from '../types';
import { logger } from '../utils/logger';
import { ZK_VERIFICATION_KEY_PATH, SOLANA_PROGRAM_ID } from '../utils/constants';
import { performanceMonitor } from '../utils/performanceMonitor';
import { LRUCache } from '../utils/lruCache';
import { BitTorrentManager } from '../bittorrent/torrent_manager';

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
  private verificationKey: any;
  private proofCache: LRUCache<string, boolean>;
  private solanaConnection: Connection;
  private bitTorrentManager: BitTorrentManager;

  constructor(solanaConnection: Connection, bitTorrentManager: BitTorrentManager) {
    this.proofCache = new LRUCache<string, boolean>(1000);
    this.solanaConnection = solanaConnection;
    this.bitTorrentManager = bitTorrentManager;
  }

  @performanceMonitor
  async initialize(): Promise<void> {
    logger.info('Initializing Decompressor...');
    try {
      this.verificationKey = await groth16.loadVerificationKey(ZK_VERIFICATION_KEY_PATH);
      await this.bitTorrentManager.initialize();
      logger.info('Decompressor initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize Decompressor:', error);
      throw error;
    }
  }

  @performanceMonitor
  async retrieveAndDecompress(
    neonConnection: NeonConnection,
    contractAddress: string,
    dataHash: string
  ): Promise<Buffer> {
    logger.info(`Retrieving and decompressing data with hash: ${dataHash}`);

    try {
      const compressedFileData = await this.retrieveCompressedFile(neonConnection, contractAddress, dataHash);
      await this.verifyProof(compressedFileData.proof, compressedFileData.publicSignals, dataHash);
      
      // Retrieve torrent info from Solana
      const torrentInfo = await this.retrieveTorrentInfoFromSolana(dataHash);
      
      // Download file using BitTorrent
      const compressedData = await this.bitTorrentManager.download(torrentInfo);
      
      return this.decompress(compressedData);
    } catch (error) {
      logger.error(`Failed to retrieve and decompress data with hash ${dataHash}:`, error);
      throw error;
    }
  }

  @performanceMonitor
  private async retrieveCompressedFile(
    connection: NeonConnection,
    contractAddress: string,
    dataHash: string
  ): Promise<CompressedFileData> {
    try {
      return await retrieveCompressedFile(connection, contractAddress, dataHash);
    } catch (error) {
      logger.error(`Failed to retrieve compressed file with hash ${dataHash}:`, error);
      throw new Error(`Failed to retrieve compressed file: ${error.message}`);
    }
  }

  @performanceMonitor
  private async retrieveTorrentInfoFromSolana(dataHash: string): Promise<TorrentInfo> {
    try {
      const programId = new PublicKey(SOLANA_PROGRAM_ID);
      const [metadataAccount] = await PublicKey.findProgramAddress(
        [Buffer.from('metadata'), Buffer.from(dataHash)],
        programId
      );

      const accountInfo = await this.solanaConnection.getAccountInfo(metadataAccount);
      if (!accountInfo) {
        throw new Error('Metadata account not found');
      }

      // Deserialize the account data to get TorrentInfo
      // This depends on how you've structured your Solana program's account data
      const torrentInfo: TorrentInfo = deserializeTorrentInfo(accountInfo.data);
      return torrentInfo;
    } catch (error) {
      logger.error(`Failed to retrieve torrent info from Solana for hash ${dataHash}:`, error);
      throw error;
    }
  }

  @performanceMonitor
  private async verifyProof(proof: ProofData, publicSignals: PublicSignals, dataHash: string): Promise<void> {
    const cacheKey = this.generateProofCacheKey(proof, publicSignals);
    
    if (this.proofCache.has(cacheKey)) {
      logger.debug('Using cached proof verification result');
      if (!this.proofCache.get(cacheKey)) {
        throw new ProofVerificationError('Invalid proof (cached result)');
      }
      return;
    }

    logger.debug('Verifying proof...');
    try {
      const isValid = await groth16.verify(this.verificationKey, publicSignals, proof);
      this.proofCache.set(cacheKey, isValid);

      if (!isValid) {
        throw new ProofVerificationError('Invalid proof');
      }

      // Additional verification: check if the public signals match the data hash
      const calculatedHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(publicSignals[0]));
      if (calculatedHash !== dataHash) {
        throw new ProofVerificationError('Public signals do not match data hash');
      }

      logger.debug('Proof verified successfully');
    } catch (error) {
      logger.error('Proof verification failed:', error);
      throw error;
    }
  }

  @performanceMonitor
  private decompress(compressedData: Buffer): Buffer {
    logger.debug(`Decompressing data of size ${compressedData.length} bytes`);
    try {
      // Implement your custom ZK decompression algorithm here
      // This is a placeholder implementation using zlib
      const zlib = require('zlib');
      const decompressedData = zlib.inflateSync(compressedData);
      logger.debug(`Data decompressed to ${decompressedData.length} bytes`);
      return decompressedData;
    } catch (error) {
      logger.error('Decompression failed:', error);
      throw new DecompressionError(`Failed to decompress data: ${error.message}`);
    }
  }

  private generateProofCacheKey(proof: ProofData, publicSignals: PublicSignals): string {
    return ethers.utils.keccak256(ethers.utils.toUtf8Bytes(JSON.stringify({ proof, publicSignals })));
  }

  async cleanup(): Promise<void> {
    logger.info('Cleaning up Decompressor...');
    this.proofCache.clear();
    await this.bitTorrentManager.cleanup();
  }
}

// Helper function to deserialize TorrentInfo from Solana account data
function deserializeTorrentInfo(data: Buffer): TorrentInfo {
  // Implement deserialization logic based on your Solana program's account structure
  // This is a placeholder and needs to be implemented
  return {
    infoHash: data.slice(0, 20).toString('hex'),
    pieceLength: data.readUInt32LE(20),
    // ... other fields
  };
}

// Export a factory function instead of a singleton
export function createDecompressor(solanaConnection: Connection, bitTorrentManager: BitTorrentManager): Decompressor {
  return new Decompressor(solanaConnection, bitTorrentManager);
}