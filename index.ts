import { CipherZeroClient } from './zk_compression/compression';
import { SolanaConnection } from './solana/connection';
import { BitTorrentManager } from './bittorrent/torrent_manager';
import { CONTRACT_ADDRESS, RPC_URL, SOLANA_RPC_URL } from './utils/constants';
import { logger } from './utils/logger';
import { performance } from 'perf_hooks';
import { Data, CompressedData, ProcessingStats } from './types';
import * as fs from 'fs';
import * as path from 'path';




async function initializeClient(): Promise<CipherZeroClient> {
  logger.info('Initializing Cipher Zero Protocol client...');
 const solanaConnection = new SolanaConnection(SOLANA_RPC_URL, 'mainnet-beta'); // Adjust 'mainnet-beta' to the appropriate cluster if needed
  const bitTorrentManager = new BitTorrentManager();
  
  const client = new CipherZeroClient( solanaConnection, bitTorrentManager);
  await client.initialize(CONTRACT_ADDRESS);
  logger.info('Cipher Zero Protocol client initialized successfully');
  return client;
}

async function processFile(client: CipherZeroClient, fileData: Data): Promise<ProcessingStats> {
  const startTime = performance.now();
  let stats: ProcessingStats = { success: false, processingTime: 0 };

  try {
    logger.info(`Processing file: ${fileData.name}`);
    
    // Step 1: ZK Compress the file
    const compressedData = await client.zkCompress(fileData.data);
    
    // Step 2: Upload to BitTorrent network
    const torrentInfo = await client.uploadToBitTorrent(compressedData);
    
    // Step 3: Store metadata on Solana
    const solanaTransaction = await client.storeSolanaMetadata(fileData.name, torrentInfo);
    
    // Step 4: Create ZK proof and store on Neon EVM
    const neonTransaction = await client.storeNeonProof(solanaTransaction.signature, compressedData.dataHash);
    
    logger.info(`File processed successfully. Solana TX: ${solanaTransaction.signature}, Neon TX: ${neonTransaction}`);

    // Verification (optional in production)
    const retrievedData = await client.retrieveAndDecompress(compressedData.dataHash);
    if (Buffer.compare(fileData.data, retrievedData) === 0) {
      logger.info('Verification successful: Decompressed data matches original file');
    } else {
      logger.warn('Verification failed: Decompressed data does not match original file');
    }

    stats.success = true;
  } catch (error) {
    logger.error('File processing error:', error);
  } finally {
    const endTime = performance.now();
    stats.processingTime = Number((endTime - startTime).toFixed(2));
    logger.info(`File processing time: ${stats.processingTime}ms`);
  }

  return stats;
}

async function batchProcessFiles(client: CipherZeroClient, directory: string): Promise<ProcessingStats[]> {
  const files = await readFilesFromDirectory(directory);
  logger.info(`Found ${files.length} files to process`);

  const batchSize = 5; // Adjust based on your needs
  let allStats: ProcessingStats[] = [];

  for (let i = 0; i < files.length; i += batchSize) {
    const batch = files.slice(i, i + batchSize);
    const batchStats = await Promise.all(batch.map(file => processFile(client, file)));
    allStats = allStats.concat(batchStats);
    logger.info(`Completed batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(files.length / batchSize)}`);
  }

  return allStats;
}

async function main() {
  let client: CipherZeroClient | null = null;

  try {
    client = await initializeClient();

    // Example usage
    const singleFileData: FileData = {
      name: 'example.txt',
      data: Buffer.from('Example file content')
    };
    await processFile(client, singleFileData);

    // Batch processing example
    const directoryPath = './data'; // Adjust to your data directory
    const batchStats = await batchProcessFiles(client, directoryPath);

    // Log overall statistics
    const successCount = batchStats.filter(stat => stat.success).length;
    const avgProcessingTime = batchStats.reduce((sum, stat) => sum + stat.processingTime, 0) / batchStats.length;
    logger.info(`Batch processing completed. Success rate: ${(successCount / batchStats.length * 100).toFixed(2)}%`);
    logger.info(`Average processing time: ${avgProcessingTime.toFixed(2)}ms`);

  } catch (error) {
    
  } finally {
    if (client) {
      await client.cleanup();
      logger.info('Client cleanup completed');
    }
  }
}

main().catch(error => {
  
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  
  process.exit(1);
});
const readdir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);

async function readFilesFromDirectory(directory: string): Promise<Data[]> {
  const files: Data[] = [];
  const fileNames = await readdir(directory);

  for (const fileName of fileNames) {
    const filePath = path.join(directory, fileName);
    const fileData = await readFile(filePath);
    files.push({ name: fileName, data: fileData });
  }

  return files;
// Removed the custom promisify function throw new Error('Function not implemented.');
}

