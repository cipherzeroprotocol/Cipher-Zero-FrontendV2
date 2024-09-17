import { ethers } from "ethers";
import { NeonConnection } from "./connection";
import {
  CIPHER_ZERO_ABI,
  GAS_LIMIT_MULTIPLIER,
  MAX_RETRIES,
  RETRY_DELAY,
} from "../utils/constants";
import { logger } from "../utils/logger";
// import { performanceMonitor } from "../utils/performanceMonitor";
import { retry } from "../utils/retry";
import { ContractInteractionError } from "../utils/errors";
import { CompressedFileData, ProofData, PublicSignals } from "../types";

class CipherZeroContract {
  private contract: ethers.Contract;

  constructor(
    private connection: NeonConnection,
    private contractAddress: string
  ) {
    this.contract = new ethers.Contract(
      contractAddress,
      CIPHER_ZERO_ABI,
      connection.getProvider()
    );
  }

  // @performanceMonitor
  public async uploadCompressedFile(
    compressedData: Buffer,
    proof: ProofData,
    publicSignals: PublicSignals
  ): Promise<string> {
    try {
      const signer = await this.connection.getSigner();
      const contractWithSigner = this.contract.connect(signer);

      const gasEstimate = await this.estimateGas(
        contractWithSigner,
        "uploadCompressedFile",
        [compressedData, proof, publicSignals]
      );

      const tx = await retry(
        () =>
          contractWithSigner.uploadCompressedFile(
            compressedData,
            proof,
            publicSignals,
            {
              gasLimit: gasEstimate,
            }
          ),
        MAX_RETRIES,
        RETRY_DELAY
      );

      const receipt = await tx.wait();
      logger.info(
        `File uploaded successfully. Transaction hash: ${receipt.transactionHash}`
      );
      return receipt.transactionHash;
    } catch (error) {
      logger.error("Failed to upload compressed file:", error);
      throw new ContractInteractionError(
        "Failed to upload compressed file",
        error
      );
    }
  }

  @performanceMonitor
  public async retrieveCompressedFile(
    dataHash: string
  ): Promise<CompressedFileData> {
    try {
      const result = await retry(
        () => this.contract.getCompressedFile(dataHash),
        MAX_RETRIES,
        RETRY_DELAY
      );

      return {
        compressedData: Buffer.from(result.compressedData.slice(2), "hex"),
        proof: result.proof,
        publicSignals: result.publicSignals,
      };
    } catch (error) {
      logger.error(
        `Failed to retrieve compressed file with hash ${dataHash}:`,
        error
      );
      throw new ContractInteractionError(
        "Failed to retrieve compressed file",
        error
      );
    }
  }

  @performanceMonitor
  public async getFileCount(): Promise<number> {
    try {
      return await retry(
        () => this.contract.getFileCount(),
        MAX_RETRIES,
        RETRY_DELAY
      );
    } catch (error) {
      logger.error("Failed to get file count:", error);
      throw new ContractInteractionError("Failed to get file count", error);
    }
  }

  @performanceMonitor
  public async getFileHashByIndex(index: number): Promise<string> {
    try {
      return await retry(
        () => this.contract.getFileHashByIndex(index),
        MAX_RETRIES,
        RETRY_DELAY
      );
    } catch (error) {
      logger.error(`Failed to get file hash for index ${index}:`, error);
      throw new ContractInteractionError(
        "Failed to get file hash by index",
        error
      );
    }
  }

  @performanceMonitor
  private async estimateGas(
    contract: ethers.Contract,
    method: string,
    params: any[]
  ): Promise<ethers.BigNumber> {
    try {
      const gasEstimate = await contract.estimateGas[method](...params);
      return gasEstimate.mul(GAS_LIMIT_MULTIPLIER);
    } catch (error) {
      logger.error(`Failed to estimate gas for method ${method}:`, error);
      throw new ContractInteractionError("Failed to estimate gas", error);
    }
  }
}

export async function createCipherZeroContract(
  connection: NeonConnection,
  contractAddress: string
): Promise<CipherZeroContract> {
  const contract = new CipherZeroContract(connection, contractAddress);
  // You might want to add some initialization logic here if needed
  return contract;
}

export { CipherZeroContract };
