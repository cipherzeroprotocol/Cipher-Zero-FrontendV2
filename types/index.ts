import { PublicKey } from '@solana/web3.js';

// Basic types
export type Address = PublicKey;
export type Hash = string;
export type Signature = string;

// Compressed Data
export interface CompressedData {
  dataHash: Hash;
  signature: Signature;
  compressionType: CompressionType;
  originalSize: number;
  compressedSize: number;
}

// Proof Data
export interface ProofData {
  a: [string, string];
  b: [[string, string], [string, string]];
  c: [string, string];
}

export interface PublicSignals {
  [key: string]: string;
}

// File Types
export enum FileType {
  Document = 'document',
  Image = 'image',
  Video = 'video',
  Audio = 'audio',
  Other = 'other'
}

export interface FileMetadata {
  name: string;
  size: number;
  type: FileType;
  lastModified: number;
  mimeType: string;
}

export interface CompressedFile extends CompressedData {
  metadata: FileMetadata;
}

// Image specific
export interface ImageMetadata extends FileMetadata {
  width: number;
  height: number;
  format: string; // e.g., 'jpeg', 'png', 'gif'
}

export interface CompressedImage extends CompressedFile {
  metadata: ImageMetadata;
}

// Video specific
export interface VideoMetadata extends FileMetadata {
  duration: number;
  resolution: {
    width: number;
    height: number;
  };
  codec: string;
}

export interface CompressedVideo extends CompressedFile {
  metadata: VideoMetadata;
}

// Audio specific
export interface AudioMetadata extends FileMetadata {
  duration: number;
  bitrate: number;
  codec: string;
}

export interface CompressedAudio extends CompressedFile {
  metadata: AudioMetadata;
}

// Cryptocurrency
export enum TokenType {
  Native = 'native',
  SPL = 'spl',
}

export interface TokenMetadata {
  name: string;
  symbol: string;
  decimals: number;
  mintAddress: PublicKey;
}

export interface TokenBalance {
  type: TokenType;
  metadata: TokenMetadata;
  balance: bigint;
}

export interface TokenTransfer {
  from: PublicKey;
  to: PublicKey;
  amount: bigint;
  mint: PublicKey;
}

// Compression
export enum CompressionType {
  ZLib = 'zlib',
  LZMA = 'lzma',
  Custom = 'custom'
}

export interface CompressionStats {
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  compressionTime: number;
}

// Merkle Tree
export interface MerkleProof {
  root: Hash;
  leaf: Hash;
  siblings: Hash[];
  path: number[];
}

// Transaction
export interface TransactionData {
  from: PublicKey;
  to: PublicKey;
  value: bigint;
  data: Buffer;
  recentBlockhash: string;
}

export interface TransactionReceipt {
  signature: Signature;
  slot: number;
  blockTime?: number;
  confirmations: number;
  err: any | null;
}

// Logs
export interface Log {
  signature: Signature;
  logs: string[];
}

// User
export interface UserProfile {
  publicKey: PublicKey;
  username: string;
  email?: string;
  avatarHash?: Hash;
}

// Error
export interface ErrorResponse {
  code: number;
  message: string;
  details?: any;
}

// API Responses
export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  pageSize: number;
  pageNumber: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ErrorResponse;
}

// Cipher Zero Protocol specific
export interface CipherZeroState {
  totalFiles: number;
  totalUsers: number;
  totalDataSize: number;
  compressionRatio: number;
}

export interface CipherZeroStats {
  dailyActiveUsers: number;
  dailyTransactions: number;
  averageCompressionRatio: number;
}


export interface CompressedData {

  compressedData: Buffer;

  proof: ProofData;

  publicSignals: PublicSignals;

}



/**
 * Interface representing a compression request.
 */
export interface CompressionRequest {
  data: any;             // The data to be compressed.
  programId: string;     // The program ID of the ZK Compression API.
}

/**
* Interface representing the result of a compression operation.
*/
export interface CompressionResult {
  compressedData: string;    // The compressed data in string format.
  originalSize: number;      // The size of the original data before compression (in bytes).
  compressedSize: number;    // The size of the compressed data (in bytes).
}

/**
* Interface representing a decompression request.
*/
export interface DecompressionRequest {
  compressedData: string;    // The compressed data to be decompressed.
  programId: string;         // The program ID of the ZK Compression API.
}

/**
* Interface representing the connection configuration for the ZK Compression API.
*/
export interface ZKConnectionConfig {
  endpoint: string;          // The endpoint URL of the ZK Compression API.
  apiKey: string;            // The API key for authenticating with the ZK Compression API.
  timeout?: number;          // Optional timeout setting for the API requests (in milliseconds).
}

/**
* Interface representing a generic ZK Connection.
*/
export interface ZKConnection {
  compress: (request: CompressionRequest) => Promise<string>;    // Method to perform data compression.
  decompress: (compressedData: string) => Promise<string>;       // Method to perform data decompression.
}

/**
* Interface representing the result of an integrity check.
*/
export interface IntegrityCheckResult {
  isValid: boolean;         // Indicates whether the integrity check passed or failed.
  message?: string;         // Optional message providing additional details about the integrity check.
}
