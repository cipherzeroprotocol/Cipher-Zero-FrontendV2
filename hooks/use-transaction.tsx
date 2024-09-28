import {
  Connection,
  Keypair,
  PublicKey,
  sendAndConfirmTransaction,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";

import bs58 from "bs58";
import { useEffect, useState } from "react";
import { RPC_ENDPOINT } from "./common/constants";
import {
  defaultTestStateTreeAccounts,
  LightSystemProgram,
} from "@lightprotocol/stateless.js";
import { getConnection } from "@/helpers/get-connection";

const mockSecretKeyFrom =
  "5XPxT2ZiaNL4K1DtE43TBYNd7vWwX4y9oMnMGCfxVCWhm9KuaViAkx3FqRhoUSZBnWQGLUEhxpVVJ2K5Auvz3tKN";
// const mockSecretKeyTo =
//   "5XPxT2ZiaNL4K1DtE43TBYNd7vWwX4y9oMnMGCfxVCWhm9KuaViAkx3FqRhoUSZBnWQGLUEhxpVVJ2K5Auvz3tKN";

const fromKeypairArray = bs58.decode(mockSecretKeyFrom);
// const toKeypairArray = bs58.decode(mockSecretKeyTo);

const memoProgramId = "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr";

const useTransaction = () => {
  // const [connection, setConnection] = useState<Connection | null>(null);
  const [from, setFrom] = useState<Keypair | null>(null);
  // const [to, setTo] = useState<Keypair | null>(null);

  const sendMessage = async (message: string, to: PublicKey) => {
    try {
      const connection = getConnection();
      if (!connection) throw new Error("Connection not established");

      if (!from || !to) throw new Error("Keypairs not initialized");

      const lamportsToSend = 15_000;

      const ix = await LightSystemProgram.compress({
        payer: from.publicKey,
        toAddress: to,
        lamports: lamportsToSend,
        outputStateTree: defaultTestStateTreeAccounts().merkleTree,
      });

      const newTransaction = new Transaction();

      newTransaction.add(ix);

      const transactionInstruction2: TransactionInstruction =
        new TransactionInstruction({
          keys: [
            {
              pubkey: from.publicKey,
              isSigner: true,
              isWritable: true,
            },
          ],
          data: Buffer.from(message, "utf-8"),
          programId: new PublicKey(memoProgramId),
        });

      // newTransaction.add(transactionInstruction1);
      newTransaction.add(transactionInstruction2);

      const transactionSignature = await sendAndConfirmTransaction(
        connection,
        newTransaction,
        [from]
      );

      return transactionSignature;
    } catch (error) {
      console.log("Failed to send message:", error);
      return null;
    }
  };

  const receiveMessages = async (own: PublicKey, to: PublicKey) => {
    const connection = getConnection();
    if (!connection) throw new Error("Connection not established");

    const signatures = await connection.getSignaturesForAddress(to, {
      limit: 20,
    });

    const memoMessages: {
      sender: string;
      recipient: string;
      message: string;
      signature: string;
    }[] = [];
    console.log("Own: ", own.toBase58());
    console.log("To: ", to.toBase58());
    console.log("Signature: ", signatures);

    signatures.forEach(async ({ signature }) => {
      if (signatures.length > 0) {
        const transactionDetails = await connection.getTransaction(signature);

        if (!transactionDetails) {
          throw new Error("Failed to fetch transaction details");
        }

        const memoInstruction =
          transactionDetails.transaction.message.instructions.find(
            (instruction) => {
              const programId =
                transactionDetails.transaction.message.accountKeys[
                  instruction.programIdIndex
                ];
              return programId.equals(new PublicKey(memoProgramId));
            }
          );

        if (!memoInstruction) {
          throw new Error("No memo instruction found");
        }

        const senderIndex = memoInstruction.accounts[0];
        const senderPublicKey =
          transactionDetails.transaction.message.accountKeys[senderIndex];

        const recipientIndex = memoInstruction.accounts[1];
        const recipientPublicKey =
          transactionDetails.transaction.message.accountKeys[recipientIndex];

        if (
          (senderPublicKey.equals(own) && recipientPublicKey.equals(to)) ||
          (senderPublicKey.equals(to) && recipientPublicKey.equals(own))
        ) {
          const memoData = memoInstruction.data;
          const memoMessage = new TextDecoder("utf-8").decode(
            bs58.decode(memoData)
          );

          memoMessages.push({
            sender: senderPublicKey.toBase58(),
            recipient: recipientPublicKey.toBase58(),
            message: memoMessage,
            signature,
          });
        }

        // console.log("---------------------------------------------");
        // console.log("Sender Public Key: ", senderPublicKey.toBase58());
        // console.log("Memo Message: ", memoMessage);
        // console.log("---------------------------------------------");

        console.log(memoMessages);

        return memoMessages;
      }
    });
  };

  const listenForAccountChanges = (
    connection: Connection,
    toAccount: Keypair
  ) => {
    console.log("Listening for account changes...");

    const subId = connection.onAccountChange(toAccount.publicKey, async () => {
      const signatures = await connection.getSignaturesForAddress(
        toAccount.publicKey,
        {
          limit: 2,
        }
      );

      signatures.forEach(async ({ signature }) => {
        if (signatures.length > 0) {
          const transactionDetails = await connection.getTransaction(signature);

          if (!transactionDetails) {
            throw new Error("Failed to fetch transaction details");
          }

          const memoInstruction =
            transactionDetails.transaction.message.instructions.find(
              (instruction) => {
                const programId =
                  transactionDetails.transaction.message.accountKeys[
                    instruction.programIdIndex
                  ];
                return programId.equals(new PublicKey(memoProgramId));
              }
            );

          if (!memoInstruction) {
            throw new Error("No memo instruction found");
          }

          const memoData = memoInstruction.data;
          const memoMessage = new TextDecoder("utf-8").decode(
            bs58.decode(memoData)
          );

          const senderAccountIndex = memoInstruction.accounts[0];
          const senderPublicKey =
            transactionDetails.transaction.message.accountKeys[
              senderAccountIndex
            ];

          console.log("---------------------------------------------");
          console.log("Sender Public Key: ", senderPublicKey.toBase58());
          console.log("Memo Message: ", memoMessage);
          console.log("---------------------------------------------");
        }
      });
    });

    return subId;
  };

  useEffect(() => {
    const newConnection = new Connection(RPC_ENDPOINT, "confirmed");

    const fromAccount = Keypair.fromSecretKey(fromKeypairArray);
    // const toAccount = Keypair.fromSecretKey(toKeypairArray);

    setFrom(fromAccount);
    // setTo(toAccount);

    const subscriptionId = listenForAccountChanges(newConnection, fromAccount);

    // setConnection(newConnection);

    return () => {
      newConnection.removeAccountChangeListener(subscriptionId);
    };
  }, []);

  return {
    sendMessage,
    receiveMessages,
  };
};

export default useTransaction;
