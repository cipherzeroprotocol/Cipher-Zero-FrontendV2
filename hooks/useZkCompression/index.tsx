import { createRpc, Rpc } from "@lightprotocol/stateless.js";
import { RPC_ENDPOINT } from "./constants";
import { useEffect, useState } from "react";

const COMPRESSION_RPC_ENDPOINT = RPC_ENDPOINT;

const useZkCompression = () => {
  const [connection, setConnection] = useState<Rpc | null>(null);

  const getSlot = async (): Promise<number> => {
    try {
      if (connection === null) {
        throw new Error("Connection not established");
      }
      const slot = await connection.getSlot();
      console.log(`Current Slot: ${slot}`);
      return slot;
    } catch (error) {
      console.error("Failed to retrieve slot:", error);
      throw new Error("Slot retrieval failed");
    }
  };

  const getIndexerHealth = async (): Promise<string> => {
    try {
      if (connection === null) {
        throw new Error("Connection not established");
      }
      const health = await connection.getIndexerHealth();
      console.log(`Indexer Health: ${health}`);
      return health;
    } catch (error) {
      console.error("Failed to retrieve indexer health:", error);
      throw new Error("Indexer health check failed");
    }
  };

  // const compressData = async (data: any): Promise<CompressionResult> => {
  //   // Validate the data before compression
  //   if (!validateData(data)) {
  //     throw new Error("Invalid data provided for compression");
  //   }

  //   if (connection === null) {
  //     throw new Error("Connection not established");
  //   }

  //   // Format the data for compression
  //   const formattedData = formatDataForCompression(data);

  //   // Create the compression request
  //   const compressionRequest: CompressionRequest = {
  //     data: formattedData,
  //     programId: ZK_COMPRESSION_PROGRAM_ID,
  //   };

  //   try {
  //     // Perform the compression using the connected API
  //     const compressedData = await connection.compress(compressionRequest);

  //     const compressedData = await compress({
  //       data: formattedData,
  //       programId: ZK_COMPRESSION_PROGRAM_ID,
  //     });

  //     // Return the compressed data result
  //     return {
  //       compressedData,
  //       originalSize: Buffer.byteLength(JSON.stringify(data)),
  //       compressedSize: Buffer.byteLength(compressedData),
  //     };
  //   } catch (error) {
  //     console.error("Compression error:", error);
  //     throw new Error("Failed to compress data");
  //   }
  // };

  const createConnection = () => {
    const rpcConnection = createRpc(RPC_ENDPOINT, COMPRESSION_RPC_ENDPOINT);
    setConnection(rpcConnection);
  };

  const main = async () => {
    try {
      await getSlot();
      await getIndexerHealth();
    } catch (error) {
      console.error("Error in main execution:", error);
    }
  };

  useEffect(() => {
    if (connection) {
      main();
    }
  }, [connection]);

  return { connection, createConnection };
};

export default useZkCompression;
