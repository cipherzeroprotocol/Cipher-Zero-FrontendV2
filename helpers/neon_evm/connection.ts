import { ethers } from "ethers";
import { logger } from "../utils/logger";
import { performanceMonitor } from "../utils/performanceMonitor";
import { retry } from "../utils/retry";
import { NeonConnectionError } from "../utils/errors";
import { NETWORK_CONFIG, MAX_RETRIES, RETRY_DELAY } from "../utils/constants";

export class NeonConnection {
  private provider: ethers.providers.JsonRpcProvider;
  private signer: ethers.Signer | null = null;
  private networkId: number;

  constructor(rpcUrl: string) {
    this.provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    this.networkId = 0; // Will be set in initialize()
  }

  @performanceMonitor
  public async initialize(): Promise<void> {
    try {
      await this.validateConnection();
      this.networkId = await this.getNetworkId();
      logger.info(`Connected to Neon EVM network with ID: ${this.networkId}`);
    } catch (error) {
      logger.error("Failed to initialize Neon connection:", error);
      throw new NeonConnectionError("Initialization failed", error);
    }
  }

  @performanceMonitor
  private async validateConnection(): Promise<void> {
    try {
      await retry(() => this.provider.getNetwork(), MAX_RETRIES, RETRY_DELAY);
    } catch (error) {
      throw new NeonConnectionError("Failed to connect to Neon EVM", error);
    }
  }

  @performanceMonitor
  public async getProvider(): Promise<ethers.providers.JsonRpcProvider> {
    return this.provider;
  }

  @performanceMonitor
  public async getSigner(): Promise<ethers.Signer> {
    if (!this.signer) {
      this.signer = this.provider.getSigner();
    }
    return this.signer;
  }

  @performanceMonitor
  public async getBlockNumber(): Promise<number> {
    try {
      return await retry(
        () => this.provider.getBlockNumber(),
        MAX_RETRIES,
        RETRY_DELAY
      );
    } catch (error) {
      throw new NeonConnectionError("Failed to get block number", error);
    }
  }

  @performanceMonitor
  public async getNetworkId(): Promise<number> {
    try {
      const network = await retry(
        () => this.provider.getNetwork(),
        MAX_RETRIES,
        RETRY_DELAY
      );
      return network.chainId;
    } catch (error) {
      throw new NeonConnectionError("Failed to get network ID", error);
    }
  }

  @performanceMonitor
  public async getGasPrice(): Promise<ethers.BigNumber> {
    try {
      return await retry(
        () => this.provider.getGasPrice(),
        MAX_RETRIES,
        RETRY_DELAY
      );
    } catch (error) {
      throw new NeonConnectionError("Failed to get gas price", error);
    }
  }

  @performanceMonitor
  public async estimateGas(
    transaction: ethers.utils.Deferrable<ethers.providers.TransactionRequest>
  ): Promise<ethers.BigNumber> {
    try {
      return await retry(
        () => this.provider.estimateGas(transaction),
        MAX_RETRIES,
        RETRY_DELAY
      );
    } catch (error) {
      throw new NeonConnectionError("Failed to estimate gas", error);
    }
  }

  @performanceMonitor
  public async sendTransaction(
    transaction: ethers.providers.TransactionRequest
  ): Promise<ethers.providers.TransactionResponse> {
    try {
      const signer = await this.getSigner();
      return await retry(
        () => signer.sendTransaction(transaction),
        MAX_RETRIES,
        RETRY_DELAY
      );
    } catch (error) {
      throw new NeonConnectionError("Failed to send transaction", error);
    }
  }

  @performanceMonitor
  public async waitForTransaction(
    transactionHash: string,
    confirmations?: number
  ): Promise<ethers.providers.TransactionReceipt> {
    try {
      return await this.provider.waitForTransaction(
        transactionHash,
        confirmations
      );
    } catch (error) {
      throw new NeonConnectionError("Failed to wait for transaction", error);
    }
  }

  public isConnectedToCorrectNetwork(): boolean {
    return this.networkId === NETWORK_CONFIG.expectedNetworkId;
  }

  public async disconnect(): Promise<void> {
    this.provider.removeAllListeners();
    this.signer = null;
    logger.info("Disconnected from Neon EVM");
  }
}
