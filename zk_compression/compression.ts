// zk_compression/compression.ts

import { getZKConnection } from './connection';
import { ZK_COMPRESSION_PROGRAM_ID } from '../utils/constants';
import { formatDataForCompression, validateData } from '../utils';
import { CompressionRequest, CompressionResult } from '..//types';

/**
 * Compresses the provided data using the ZK Compression API.
 * @param data - The data to be compressed.
 * @returns A promise that resolves to the compressed data result.
 * @throws Error if the compression process fails.
 */
// Removed the unused declaration
export const compressData = async (data: any): Promise<CompressionResult> => {
    // Validate the data before compression
    if (!validateData(data)) {
        throw new Error('Invalid data provided for compression');
    }

    // Format the data for compression
    const formattedData = formatDataForCompression(data);

    // Establish connection with the ZK Compression API
    const connection = getZKConnection();

    // Create the compression request
    const compressionRequest: CompressionRequest = {
        data: formattedData,
        programId: ZK_COMPRESSION_PROGRAM_ID,
    };

    try {
        // Perform the compression using the connected API
        const compressedData = await connection.compress(compressionRequest);

        // Return the compressed data result
        return {
            compressedData,
            originalSize: Buffer.byteLength(JSON.stringify(data)),
            compressedSize: Buffer.byteLength(compressedData),
        };
    } catch (error) {
        console.error('Compression error:', error);
        throw new Error('Failed to compress data');
    }
};

/**
 * Decompresses the provided data using the ZK Compression API.
 * @param compressedData - The compressed data to be decompressed.
 * @returns A promise that resolves to the original data.
 * @throws Error if the decompression process fails.
 */
export const decompressData = async (compressedData: string): Promise<any> => {
    const connection = getZKConnection();

    try {
        // Decompress the data using the connected API
        const decompressedData = await connection.decompress(compressedData);
        
        // Return the original data
        return JSON.parse(decompressedData);
    } catch (error) {
        console.error('Decompression error:', error);
        throw new Error('Failed to decompress data');
    }
};

/**
 * Verifies the integrity of the compressed data.
 * @param originalData - The original data before compression.
 * @param compressedData - The compressed data.
 * @returns A boolean indicating whether the integrity check passed.
 */
export const verifyCompressionIntegrity = (originalData: any, compressedData: string): boolean => {
    const decompressedData = JSON.stringify(decompressData(compressedData));
    return JSON.stringify(originalData) === decompressedData;
};
