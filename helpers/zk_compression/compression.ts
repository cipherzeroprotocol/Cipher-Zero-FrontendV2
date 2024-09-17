import { groth16 } from "snarkjs";
import { ethers } from "ethers";
import { NeonConnection } from "../neon_evm/connection";
import { uploadCompressedFile } from "../neon_evm/contract_interactions";
import { CompressedData, ProofData, PublicSignals } from "../types";
// import { logger } from "../utils/logger";
// import { ZK_WASM_PATH, ZK_ZKEY_PATH } from "../utils/constants";
// import { performanceMonitor } from "../utils/performanceMonitor";
// import { LRUCache } from "../utils/lruCache";

export class CipherZeroClient {
  private connection: NeonConnection;
  private contractAddress: string;
  private proofCache: LRUCache<
    string,
    { proof: ProofData; publicSignals: PublicSignals }
  >;

  constructor(connection: NeonConnection) {
    this.connection = connection;
    this.proofCache = new LRUCache(100); // Cache last 100 proofs
  }

  // @performanceMonitor
  async initialize(contractAddress: string): Promise<void> {
    this.contractAddress = contractAddress;
    logger.info("Initializing CipherZeroClient...");

    try {
      // Validate contract address
      if (!ethers.utils.isAddress(contractAddress)) {
        throw new Error("Invalid contract address");
      }

      // Additional initialization logic (e.g., loading ZK parameters)
      await this.loadZkParameters();

      logger.info("CipherZeroClient initialized successfully");
    } catch (error) {
      logger.error("Failed to initialize CipherZeroClient:", error);
      throw error;
    }
  }

  @performanceMonitor
  async compressAndUpload(data: Buffer): Promise<CompressedData> {
    logger.info(`Compressing and uploading data of size ${data.length} bytes`);

    try {
      const compressedData = await this.compress(data);
      logger.debug(`Data compressed to ${compressedData.length} bytes`);

      const { proof, publicSignals } = await this.generateProof(compressedData);

      const transactionHash = await uploadCompressedFile(
        this.connection,
        this.contractAddress,
        compressedData,
        proof,
        publicSignals
      );

      const dataHash = ethers.utils.keccak256(compressedData);
      logger.info(
        `Data uploaded successfully. Transaction hash: ${transactionHash}`
      );

      return { dataHash, transactionHash };
    } catch (error) {
      logger.error("Failed to compress and upload data:", error);
      throw error;
    }
  }

  @performanceMonitor
  private async compress(data: Buffer): Promise<Buffer> {
    // Implement your custom compression algorithm here
    // This is a placeholder implementation using zlib
    const zlib = require("zlib");
    return new Promise((resolve, reject) => {
      zlib.deflate(data, (err, compressedData) => {
        if (err) reject(err);
        else resolve(compressedData);
      });
    });
  }

  @performanceMonitor
  private async generateProof(
    compressedData: Buffer
  ): Promise<{ proof: ProofData; publicSignals: PublicSignals }> {
    const dataHash = ethers.utils.keccak256(compressedData);

    // Check cache first
    const cachedProof = this.proofCache.get(dataHash);
    if (cachedProof) {
      logger.debug("Using cached proof");
      return cachedProof;
    }

    logger.debug("Generating new proof");
    const input = {
      data: BigInt("0x" + compressedData.toString("hex")),
      dataHash: BigInt(dataHash),
      // Add other necessary inputs for your ZK circuit
    };

    try {
      const { proof, publicSignals } = await groth16.fullProve(
        input,
        ZK_WASM_PATH,
        ZK_ZKEY_PATH
      );

      // Convert proof to the format expected by the smart contract
      const proofForContract: ProofData = {
        a: [proof.pi_a[0], proof.pi_a[1]],
        b: [
          [proof.pi_b[0][1], proof.pi_b[0][0]],
          [proof.pi_b[1][1], proof.pi_b[1][0]],
        ],
        c: [proof.pi_c[0], proof.pi_c[1]],
      };

      const result = { proof: proofForContract, publicSignals };
      this.proofCache.set(dataHash, result);
      return result;
    } catch (error) {
      logger.error("Failed to generate proof:", error);
      throw new Error("Proof generation failed");
    }
  }

  private async loadZkParameters(): Promise<void> {
    // Load and validate ZK parameters
    // This is a placeholder - implement actual parameter loading logic
    logger.debug("Loading ZK parameters...");
    // Simulate loading time
    await new Promise((resolve) => setTimeout(resolve, 1000));
    logger.debug("ZK parameters loaded successfully");
  }

  async cleanup(): Promise<void> {
    logger.info("Cleaning up CipherZeroClient...");
    // Implement any necessary cleanup logic
    this.proofCache.clear();
  }
}
