// zk_compression/utils.ts

import { CompressionRequest } from '../types';

/**
 * Formats the input data for compression by ensuring it is in the correct structure.
 * @param data - The data to be formatted.
 * @returns The formatted data ready for compression.
 */
export const formatDataForCompression = (data: any): string => {
    // Convert the data to a string format if it isn't already
    return typeof data === 'string' ? data : JSON.stringify(data);
};

/**
 * Validates the input data to ensure it meets the criteria for compression.
 * @param data - The data to be validated.
 * @returns A boolean indicating whether the data is valid.
 */
export const validateData = (data: any): boolean => {
    // Example validation: Ensure data is not null or undefined
    return data !== null && data !== undefined;
};

/**
 * Generates a unique identifier for a compression request.
 * @param request - The compression request object.
 * @returns A unique identifier string for the request.
 */
export const generateRequestId = (request: CompressionRequest): string => {
    // Generate a simple hash based on the data and programId
    const dataHash = hashString(JSON.stringify(request.data));
    return `${request.programId}-${dataHash}`;
};

/**
 * Hashes a string using a simple hashing algorithm.
 * @param input - The string to be hashed.
 * @returns The hashed output as a string.
 */
export const hashString = (input: string): string => {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
        const char = input.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash |= 0; // Convert to 32-bit integer
    }
    return hash.toString();
};

/**
 * Checks if the compressed data size is within acceptable limits.
 * @param compressedSize - The size of the compressed data (in bytes).
 * @param originalSize - The size of the original data (in bytes).
 * @returns A boolean indicating whether the compression ratio is acceptable.
 */
export const isCompressionEfficient = (compressedSize: number, originalSize: number): boolean => {
    const compressionRatio = compressedSize / originalSize;
    // Consider compression efficient if the size is reduced by at least 50%
    return compressionRatio < 0.5;
};

/**
 * Logs detailed information about the compression operation.
 * @param originalSize - The original size of the data.
 * @param compressedSize - The size of the compressed data.
 */
export const logCompressionDetails = (originalSize: number, compressedSize: number): void => {
    const ratio = (compressedSize / originalSize).toFixed(2);
    console.log(`Original Size: ${originalSize} bytes`);
    console.log(`Compressed Size: ${compressedSize} bytes`);
    console.log(`Compression Ratio: ${ratio}`);
};

