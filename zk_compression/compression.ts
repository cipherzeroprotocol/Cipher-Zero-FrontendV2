import {
    Rpc,
    LightSystemProgram,
    createRpc,
    defaultTestStateTreeAccounts,
    buildAndSignTx
  } from "@lightprotocol/stateless.js";
  import { ZK_COMPRESSION_PROGRAM_ID, RPC_ENDPOINT } from '../utils/constants';
  import { CompressedData, CompressionResult } from '../types';
  import { formatDataForCompression, validateData } from "./utils";
  import { Keypair, PublicKey } from "@solana/web3.js";
  
  // Define the payer
  const payer = Keypair.generate();
  
  // Create a single instance of Rpc to be used across the module
  const rpc: Rpc = createRpc(RPC_ENDPOINT);
  
  export const compressData = async (data: any): Promise<CompressionResult> => {
    if (!validateData(data)) {
      throw new Error('Invalid data provided for compression');
    }
  
    const formattedData = formatDataForCompression(data);
  
    try {
      const compressIx = await LightSystemProgram.compress({
        payer: payer.publicKey,
        toAddress: payer.publicKey,
        lamports: Buffer.byteLength(JSON.stringify(formattedData)),
        outputStateTree: defaultTestStateTreeAccounts().merkleTree,
      });
  
      const { blockhash } = await rpc.getLatestBlockhash();
      const tx = buildAndSignTx([compressIx], payer, blockhash, []);
      const txId = await rpc.sendTransaction(tx);
      await rpc.confirmTransaction(txId);
  
      // Fetch the compressed data from the transaction
      const txInfo = await rpc.getTransaction(txId);
      if (!txInfo || !txInfo.meta) {
        throw new Error("Failed to fetch transaction info");
      }
  
      // Assuming the compressed data is stored in the first account after the payer
      const compressedDataAccount = txInfo.transaction.message.accountKeys[1];
      const compressedDataAccountInfo = await rpc.getAccountInfo(compressedDataAccount);
  
      if (!compressedDataAccountInfo) {
        throw new Error("Failed to fetch compressed data");
      }
  
      const compressedData: CompressedData = {
          data: compressedDataAccountInfo.data,
          dataHash: "",
          signature: "",
          compressionType: "",
          originalSize: 0,
          compressedSize: 0,
          timestamp: 0,
          metadata: {}
      };
  
      return {
        compressedData,
        originalSize: Buffer.byteLength(JSON.stringify(data)),
        compressedSize: compressedDataAccountInfo.data.length,
      };
    } catch (error) {
      console.error('Compression error:', error);
      throw new Error('Failed to compress data');
    }
  };
  
  export const decompressData = async (compressedData: CompressedData): Promise<any> => {
    try {
      // Here, you would implement the actual decompression logic
      // This is a placeholder and should be replaced with actual decompression
      const decompressedData = compressedData.data; // Placeholder
  
      return JSON.parse(decompressedData.toString());
    } catch (error) {
      console.error('Decompression error:', error);
      throw new Error('Failed to decompress data');
    }
  };
  
  export const verifyCompressionIntegrity = async (originalData: any, compressedData: CompressedData): Promise<boolean> => {
    const decompressedData = await decompressData(compressedData);
    return JSON.stringify(originalData) === JSON.stringify(decompressedData);
  };