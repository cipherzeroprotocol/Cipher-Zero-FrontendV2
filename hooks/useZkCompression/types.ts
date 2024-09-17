// zk_compression/types.ts

/**
 * Interface representing a compression request.
 */
export interface CompressionRequest {
  data: any; // The data to be compressed.
  programId: string; // The program ID of the ZK Compression API.
}

/**
 * Interface representing the result of a compression operation.
 */
export interface CompressionResult {
  compressedData: string; // The compressed data in string format.
  originalSize: number; // The size of the original data before compression (in bytes).
  compressedSize: number; // The size of the compressed data (in bytes).
}

/**
 * Interface representing a decompression request.
 */
export interface DecompressionRequest {
  compressedData: string; // The compressed data to be decompressed.
  programId: string; // The program ID of the ZK Compression API.
}

/**
 * Interface representing the connection configuration for the ZK Compression API.
 */
export interface ZKConnectionConfig {
  endpoint: string; // The endpoint URL of the ZK Compression API.
  apiKey: string; // The API key for authenticating with the ZK Compression API.
  timeout?: number; // Optional timeout setting for the API requests (in milliseconds).
}

/**
 * Interface representing a generic ZK Connection.
 */
export interface ZKConnection {
  compress: (request: CompressionRequest) => Promise<string>; // Method to perform data compression.
  decompress: (compressedData: string) => Promise<string>; // Method to perform data decompression.
}

/**
 * Interface representing the result of an integrity check.
 */
export interface IntegrityCheckResult {
  isValid: boolean; // Indicates whether the integrity check passed or failed.
  message?: string; // Optional message providing additional details about the integrity check.
}
