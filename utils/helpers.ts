import { PublicKey } from '@solana/web3.js';
import { createHash, randomBytes } from 'crypto';
import { logger } from './logger';

export function bufferToHex(buffer: Buffer): string {
  return buffer.toString('hex');
}

export function hexToBuffer(hex: string): Buffer {
  return Buffer.from(hex, 'hex');
}

export async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function isValidPublicKey(address: string): boolean {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
}

export function sha256(data: Buffer | string): Buffer {
  return createHash('sha256').update(data).digest();
}

export function generateRandomBytes(length: number): Buffer {
  return randomBytes(length);
}

export function padBuffer(buffer: Buffer, length: number, padStart = true): Buffer {
  if (buffer.length >= length) return buffer;
  const padding = Buffer.alloc(length - buffer.length);
  return padStart ? Buffer.concat([padding, buffer]) : Buffer.concat([buffer, padding]);
}

export function truncateBuffer(buffer: Buffer, maxLength: number): Buffer {
  return buffer.length <= maxLength ? buffer : buffer.slice(0, maxLength);
}

export function compareBuffers(a: Buffer, b: Buffer): number {
  return a.compare(b);
}

export function isBufferEqual(a: Buffer, b: Buffer): boolean {
  return a.equals(b);
}

export function retry<T>(
  fn: () => Promise<T>,
  maxRetries: number,
  delay: number,
  shouldRetry?: (error: any) => boolean
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    let attempts = 0;
    const executeWithRetry = async () => {
      try {
        const result = await fn();
        resolve(result);
      } catch (error) {
        attempts++;
        if (attempts >= maxRetries || (shouldRetry && !shouldRetry(error))) {
          reject(error);
        } else {
          logger.warn(`Retrying operation. Attempt ${attempts} of ${maxRetries}`);
          setTimeout(executeWithRetry, delay);
        }
      }
    };
    executeWithRetry();
  });
}

export function memoize<T>(fn: (...args: any[]) => T): (...args: any[]) => T {
  const cache = new Map<string, T>();
  return (...args: any[]) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key)!;
    }
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
}

export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

export function lamportsToSol(lamports: number): number {
  return lamports / 1e9;
}

export function solToLamports(sol: number): number {
  return sol * 1e9;
}