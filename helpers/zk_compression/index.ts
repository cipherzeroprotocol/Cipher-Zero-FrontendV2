import { CipherZeroClient } from "./zk_compression/compression";
import { NeonConnection } from "./neon_evm/connection";
import { CONTRACT_ADDRESS, RPC_URL } from "./utils/constants";
import { logger } from "./utils/logger";
import { performance } from "perf_hooks";
import { FileData, CompressedData } from "./types";
import { readFilesFromDirectory } from "./utils/fileHelpers";

async function initializeClient(): Promise<CipherZeroClient> {
  logger.info("Initializing Cipher Zero Protocol client...");
  const neonConnection = new NeonConnection(RPC_URL);
  const client = new CipherZeroClient(neonConnection);
  await client.initialize(CONTRACT_ADDRESS);
  logger.info("Cipher Zero Protocol client initialized successfully");
  return client;
}

async function processFile(
  client: CipherZeroClient,
  fileData: FileData
): Promise<void> {
  const startTime = performance.now();

  try {
    logger.info(`Processing file: ${fileData.name}`);
    const compressedData = await client.compressAndUpload(fileData.data);
    logger.info(
      `File compressed and uploaded: ${compressedData.transactionHash}`
    );

    const retrievedData = await client.retrieveAndDecompress(
      compressedData.dataHash
    );
    logger.info(
      `File retrieved and decompressed. Size: ${retrievedData.length} bytes`
    );

    if (Buffer.compare(fileData.data, retrievedData) === 0) {
      logger.info("Decompressed data matches original file");
    } else {
      logger.warn("Decompressed data does not match original file");
    }
  } catch (error) {
    logger.error(`Error processing file ${fileData.name}:`, error);
  } finally {
    const endTime = performance.now();
    logger.info(`File processing time: ${(endTime - startTime).toFixed(2)}ms`);
  }
}

async function batchProcessFiles(
  client: CipherZeroClient,
  directory: string
): Promise<void> {
  const files = await readFilesFromDirectory(directory);
  logger.info(`Found ${files.length} files to process`);

  const batchSize = 5; // Adjust based on your needs
  for (let i = 0; i < files.length; i += batchSize) {
    const batch = files.slice(i, i + batchSize);
    await Promise.all(batch.map((file) => processFile(client, file)));
    logger.info(
      `Completed batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(files.length / batchSize)}`
    );
  }
}

async function main() {
  let client: CipherZeroClient | null = null;

  try {
    client = await initializeClient();

    // Example usage
    const singleFileData: FileData = {
      name: "example.txt",
      data: Buffer.from("Example file content"),
    };
    await processFile(client, singleFileData);

    // Batch processing example
    const directoryPath = "./data"; // Adjust to your data directory
    await batchProcessFiles(client, directoryPath);
  } catch (error) {
    logger.error("Fatal error:", error);
  } finally {
    if (client) {
      await client.cleanup();
      logger.info("Client cleanup completed");
    }
  }
}

main().catch((error) => {
  logger.error("Unhandled error in main function:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});
