import { groth16 } from "snarkjs";
import { ethers } from "ethers";
import { NeonConnection } from "../neon_evm/connection";
import { retrieveCompressedFile } from "../neon_evm/contract_interactions";
import { CompressedFileData, ProofData, PublicSignals } from "../types";
import { logger } from "../utils/logger";
import { ZK_VERIFICATION_KEY_PATH } from "../utils/constants";
import { performanceMonitor } from "../utils/performanceMonitor";
import { LRUCache } from "../utils/lruCache";

class DecompressionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DecompressionError";
  }
}

class ProofVerificationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProofVerificationError";
  }
}

export class Decompressor {
  private verificationKey: any;
  private proofCache: LRUCache<string, boolean>;

  constructor() {
    this.proofCache = new LRUCache<string, boolean>(1000); // Cache last 1000 proof verifications
  }

  @performanceMonitor
  async initialize(): Promise<void> {
    logger.info("Initializing Decompressor...");
    try {
      this.verificationKey = await groth16.loadVerificationKey(
        ZK_VERIFICATION_KEY_PATH
      );
      logger.info("Decompressor initialized successfully");
    } catch (error) {
      logger.error("Failed to initialize Decompressor:", error);
      throw error;
    }
  }

  @performanceMonitor
  async retrieveAndDecompress(
    connection: NeonConnection,
    contractAddress: string,
    dataHash: string
  ): Promise<Buffer> {
    logger.info(`Retrieving and decompressing data with hash: ${dataHash}`);

    try {
      const compressedFileData = await this.retrieveCompressedFile(
        connection,
        contractAddress,
        dataHash
      );
      await this.verifyProof(
        compressedFileData.proof,
        compressedFileData.publicSignals,
        dataHash
      );
      return this.decompress(compressedFileData.compressedData);
    } catch (error) {
      logger.error(
        `Failed to retrieve and decompress data with hash ${dataHash}:`,
        error
      );
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
      return await retrieveCompressedFile(
        connection,
        contractAddress,
        dataHash
      );
    } catch (error) {
      logger.error(
        `Failed to retrieve compressed file with hash ${dataHash}:`,
        error
      );
      throw new Error(`Failed to retrieve compressed file: ${error.message}`);
    }
  }

  @performanceMonitor
  private async verifyProof(
    proof: ProofData,
    publicSignals: PublicSignals,
    dataHash: string
  ): Promise<void> {
    const cacheKey = this.generateProofCacheKey(proof, publicSignals);

    if (this.proofCache.has(cacheKey)) {
      logger.debug("Using cached proof verification result");
      if (!this.proofCache.get(cacheKey)) {
        throw new ProofVerificationError("Invalid proof (cached result)");
      }
      return;
    }

    logger.debug("Verifying proof...");
    try {
      const isValid = await groth16.verify(
        this.verificationKey,
        publicSignals,
        proof
      );
      this.proofCache.set(cacheKey, isValid);

      if (!isValid) {
        throw new ProofVerificationError("Invalid proof");
      }

      // Additional verification: check if the public signals match the data hash
      const calculatedHash = ethers.utils.keccak256(
        ethers.utils.toUtf8Bytes(publicSignals[0])
      );
      if (calculatedHash !== dataHash) {
        throw new ProofVerificationError(
          "Public signals do not match data hash"
        );
      }

      logger.debug("Proof verified successfully");
    } catch (error) {
      logger.error("Proof verification failed:", error);
      throw error;
    }
  }

  @performanceMonitor
  private decompress(compressedData: Buffer): Buffer {
    logger.debug(`Decompressing data of size ${compressedData.length} bytes`);
    try {
      // Implement your custom decompression algorithm here
      // This is a placeholder implementation using zlib
      const zlib = require("zlib");
      const decompressedData = zlib.inflateSync(compressedData);
      logger.debug(`Data decompressed to ${decompressedData.length} bytes`);
      return decompressedData;
    } catch (error) {
      logger.error("Decompression failed:", error);
      throw new DecompressionError(
        `Failed to decompress data: ${error.message}`
      );
    }
  }

  private generateProofCacheKey(
    proof: ProofData,
    publicSignals: PublicSignals
  ): string {
    // Generate a unique key for caching proof verification results
    return ethers.utils.keccak256(
      ethers.utils.toUtf8Bytes(JSON.stringify({ proof, publicSignals }))
    );
  }

  async cleanup(): Promise<void> {
    logger.info("Cleaning up Decompressor...");
    this.proofCache.clear();
  }
}

// Export a singleton instance
export const decompressor = new Decompressor();
