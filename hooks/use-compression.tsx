import { CompressedData } from "@/types";
import {
  bn,
  buildAndSignTx,
  CompressedAccountWithMerkleContext,
  createRpc,
  defaultTestStateTreeAccounts,
  LightSystemProgram,
  Rpc,
  selectMinCompressedSolAccountsForTransfer,
} from "@lightprotocol/stateless.js";
import { ComputeBudgetProgram, Keypair, PublicKey } from "@solana/web3.js";
import { CompressedTokenProgram } from "@lightprotocol/compressed-token";
import { RPC_ENDPOINT } from "./common/constants";

const COMPRESSION_RPC_ENDPOINT = RPC_ENDPOINT;
const connection: Rpc = createRpc(RPC_ENDPOINT, COMPRESSION_RPC_ENDPOINT);

export const useCompression = () => {
  const compressData = async (
    data: Buffer,
    fromAccount: Keypair,
    to: PublicKey
  ): Promise<CompressedData> => {
    // console.log(`Compressing data of size: ${data.length} bytes`);

    const compressIx = await LightSystemProgram.compress({
      payer: fromAccount.publicKey,
      lamports: data.length, // Use data length as lamports
      toAddress: to, // Use payer as recipient
      outputStateTree: defaultTestStateTreeAccounts().merkleTree,
    });

    // compressIx.data = data;

    const instructions = [
      ComputeBudgetProgram.setComputeUnitLimit({ units: 1_000_000 }),
      compressIx,
    ];

    const { blockhash } = await connection.getLatestBlockhash();
    const tx = buildAndSignTx(instructions, fromAccount, blockhash, []);

    const txId = await connection.sendTransaction(tx);
    await connection.confirmTransaction(txId);

    console.log(`Data compressed. Transaction ID: ${txId}`);

    // Fetch the compressed data from the transaction
    const txInfo = await connection.getParsedTransaction(txId, {
      maxSupportedTransactionVersion: 0,
    });
    if (!txInfo || !txInfo.meta) {
      throw new Error("Failed to fetch transaction info");
    }

    console.log(txInfo.transaction.message.accountKeys);

    const compressedDataAccounts = txInfo.transaction.message.accountKeys;

    // Assuming the compressed data is stored in the first account after the payer
    const compressedDataAccount = compressedDataAccounts[2];
    const compressedData = await connection.getAccountInfo(
      compressedDataAccount.pubkey
    );

    if (!compressedData) {
      throw new Error("Failed to fetch compressed data");
    }

    return {
      data: compressedData.data as unknown as Buffer,
      dataHash: compressedDataAccount.pubkey.toBase58(),
      signature: "",
      txId,
      originalSize: data.length,
      compressionType: "zk",
      compressedSize: compressedData.data.length,
      timestamp: new Date().getTime(),
      metadata: {},
    };
  };

  const decompressData = async (
    compressedData: CompressedData,
    payer: Keypair
  ): Promise<Buffer> => {
    console.log(`Decompressing data`);

    const compressedAccounts = await connection.getCompressedAccountsByOwner(
      payer.publicKey
    );

    const compressedAccountsWithMerkleContext: CompressedAccountWithMerkleContext[] =
      compressedAccounts.items.map((account) => {
        return account;
      });

    const [inputAccounts] = selectMinCompressedSolAccountsForTransfer(
      compressedAccountsWithMerkleContext,
      0
    );

    const proof = await connection.getValidityProof(
      inputAccounts.map((account) => bn(account.hash))
    );

    const decompressIx = await LightSystemProgram.decompress({
      payer: payer.publicKey,
      inputCompressedAccounts: compressedAccountsWithMerkleContext, // Pass compressed data as an array
      outputStateTree: defaultTestStateTreeAccounts().merkleTree,
      toAddress: payer.publicKey,
      lamports: 0,
      recentInputStateRootIndices: proof.rootIndices,
      recentValidityProof: proof.compressedProof,
    });

    const instructions = [
      ComputeBudgetProgram.setComputeUnitLimit({ units: 1_000_000 }),
      decompressIx,
    ];

    const { blockhash } = await connection.getLatestBlockhash();
    const tx = buildAndSignTx(instructions, payer, blockhash, []);

    const txId = await connection.sendTransaction(tx);
    await connection.confirmTransaction(txId);

    console.log(`Data decompressed. Transaction ID: ${txId}`);

    // Fetch the decompressed data from the transaction
    const txInfo = await connection.getTransaction(txId);
    if (!txInfo || !txInfo.meta) {
      throw new Error("Failed to fetch transaction info");
    }

    // Assuming the decompressed data is stored in the first account after the payer
    const decompressedDataAccount = txInfo.transaction.message.accountKeys[1];
    const decompressedData = await connection.getAccountInfo(
      decompressedDataAccount
    );

    console.log(decompressedData);

    if (!decompressedData) {
      throw new Error("Failed to fetch decompressed data");
    }

    return Buffer.from(decompressedData.data);
  };

  const compressToken = async (
    payer: Keypair,
    recipientPublicKey: PublicKey
  ) => {
    const publicKey = payer.publicKey;
    const mint = payer.publicKey;
    const amount = bn(1e7);

    const compressedTokenAccounts =
      await connection.getCompressedTokenAccountsByOwner(publicKey, {
        mint,
      });

    const compressedAccountsWithMerkleContext: CompressedAccountWithMerkleContext[] =
      compressedTokenAccounts.items.map((account) => {
        return account.compressedAccount;
      });

    const [inputAccounts] = selectMinCompressedSolAccountsForTransfer(
      compressedAccountsWithMerkleContext,
      amount
    );

    const proof = await connection.getValidityProof(
      inputAccounts.map((account) => bn(account.hash))
    );

    const ix = await CompressedTokenProgram.transfer({
      payer: publicKey,
      inputCompressedTokenAccounts: compressedTokenAccounts.items,
      toAddress: recipientPublicKey,
      amount,
      recentInputStateRootIndices: proof.rootIndices,
      recentValidityProof: proof.compressedProof,
    });

    console.log(ix);
  };

  return {
    compressData,
    decompressData,
    compressToken,
  };
};
