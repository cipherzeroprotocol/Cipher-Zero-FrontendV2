import { Connection, PublicKey, Transaction, TransactionInstruction, SendOptions, Keypair, SystemProgram } from '@solana/web3.js';
import { logger } from '../utils/logger';
//import { performanceMonitor } from '../utils/performanceMonitor';
//import { retry } from '../utils/retry';
//import { SolanaConnectionError } from '../utils/errors';
import { NETWORK_CONFIG, MAX_RETRIES, RETRY_DELAY } from '../utils/constants';
import { retry } from '@/utils/helpers';

export class SolanaConnection {
  private connection: Connection;
  private payer: Keypair | null = null;
  private cluster: string;

  constructor(rpcUrl: string, cluster: string) {
    this.connection = new Connection(rpcUrl, 'confirmed');
    this.cluster = cluster;
  }

 
  public async initialize(): Promise<void> {
    try {
      await this.validateConnection();
      logger.info(`Connected to Solana ${this.cluster} cluster`);
    } catch (error) {
      logger.error('Failed to initialize Solana connection:', error);
      
    }
  }

 
  private async validateConnection(): Promise<void> {
    try {
      await retry(() => this.connection.getVersion(), MAX_RETRIES, RETRY_DELAY);
    } catch (error) {
      
    }
  }

  
  public getConnection(): Connection {
    return this.connection;
  }

  
  public async getPayer(): Promise<Keypair> {
    if (!this.payer) {
      // In a real application, you'd want to securely manage the payer's private key
      this.payer = Keypair.generate();
    }
    return this.payer;
  }

 
  public async getSlot(): Promise<number> {
    try {
      return await retry(() => this.connection.getSlot(), MAX_RETRIES, RETRY_DELAY);
    } catch (error) {
      logger.error('Failed to get slot:', error);
      return -1; // Return a default value or handle it as needed
    }
  }


  public async getRecentBlockhash(): Promise<string> {
    try {
      const { blockhash } = await retry(() => this.connection.getRecentBlockhash(), MAX_RETRIES, RETRY_DELAY);
      return blockhash;
    } catch (error) {
      logger.error('Failed to get recent blockhash:', error);
      return ''; // Return a default value or handle it as needed
    }
  }

 
  public async getMinimumBalanceForRentExemption(dataLength: number): Promise<number> {
    try {
      return await retry(() => this.connection.getMinimumBalanceForRentExemption(dataLength), MAX_RETRIES, RETRY_DELAY);
    } catch (error) {
      logger.error('Failed to get minimum balance for rent exemption:', error);
      return 0; // Return a default value or handle it as needed
    }
  }

  
  public async sendAndConfirmTransaction(
    transaction: Transaction,
    signers: Keypair[],
    options?: SendOptions
  ): Promise<string> {
    try {
      return await retry(() => this.connection.sendTransaction(transaction, signers, options), MAX_RETRIES, RETRY_DELAY);
    } catch (error) {
      logger.error('Failed to send and confirm transaction:', error);
      return ''; // Return a default value or handle it as needed
    }
  }

  
  public async confirmTransaction(signature: string, commitment?: string): Promise<boolean> {
    try {
      const result = await this.connection.confirmTransaction(signature, commitment as any);
      return result.value.err === null;
    } catch (error) {
      logger.error('Failed to confirm transaction:', error);
      return false; // Return false in case of an error
    }
  }

  public isConnectedToCorrectCluster(): boolean {
    return this.cluster === NETWORK_CONFIG.expectedCluster;
  }

  public async disconnect(): Promise<void> {
    // Solana's web3.js doesn't have a disconnect method, but we can reset our state
    this.payer = null;
    logger.info(`Disconnected from Solana ${this.cluster} cluster`);
  }

  public async createAccount(space: number, programId: PublicKey): Promise<Keypair> {
    const newAccount = Keypair.generate();
    const lamports = await this.getMinimumBalanceForRentExemption(space);

    const transaction = new Transaction().add(
      SystemProgram.createAccount({
        fromPubkey: (await this.getPayer()).publicKey,
        newAccountPubkey: newAccount.publicKey,
        lamports,
        space,
        programId,
      })
    );

    await this.sendAndConfirmTransaction(transaction, [await this.getPayer(), newAccount]);
    return newAccount;
  }
}