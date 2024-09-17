import { BigNumber } from "ethers";

// Basic types
export type Address = string;
export type Hash = string;
export type Signature = string;

// Compressed Data
export interface CompressedData {
  dataHash: Hash;
  transactionHash: Hash;
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
  Document = "document",
  Image = "image",
  Video = "video",
  Audio = "audio",
  Other = "other",
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
export enum CoinType {
  Native = "native",
  ERC20 = "erc20",
  ERC721 = "erc721",
  ERC1155 = "erc1155",
}

export interface CoinMetadata {
  name: string;
  symbol: string;
  decimals: number;
  contractAddress?: Address;
}

export interface CoinBalance {
  type: CoinType;
  metadata: CoinMetadata;
  balance: BigNumber;
}

export interface TokenTransfer {
  from: Address;
  to: Address;
  amount: BigNumber;
  tokenAddress: Address;
}

// Compression
export enum CompressionType {
  ZLib = "zlib",
  LZMA = "lzma",
  Custom = "custom",
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
  from: Address;
  to: Address;
  value: BigNumber;
  data: string;
  nonce: number;
  gasLimit: BigNumber;
  gasPrice: BigNumber;
}

export interface TransactionReceipt {
  transactionHash: Hash;
  blockNumber: number;
  blockHash: Hash;
  status: boolean;
  gasUsed: BigNumber;
  events: Event[];
}

// Event
export interface Event {
  address: Address;
  topics: string[];
  data: string;
  blockNumber: number;
  transactionHash: Hash;
  logIndex: number;
}

// User
export interface UserProfile {
  address: Address;
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

// Add more types as needed for your specific use cases
