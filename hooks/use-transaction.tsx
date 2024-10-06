import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionConfirmationStrategy,
  TransactionInstruction,
} from "@solana/web3.js";
import bs58 from "bs58";
import { useEffect, useState } from "react";
import {
  defaultTestStateTreeAccounts,
  LightSystemProgram,
} from "@lightprotocol/stateless.js";
import { getConnection } from "@/helpers/get-connection";
import { getFromLocalStorage } from "@/helpers/localStorageHelper";
import { useRouter } from "next/navigation";
import { RPC_ENDPOINT } from "./common/constants";

const accountAddressLocalStorageKey = "cipher-zero-account-info";

const memoProgramId = "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr";

const useTransaction = () => {
  const [listenerSubscription, setListenerSubscription] = useState<
    number | null
  >(null);
  const router = useRouter();

  const getCurrentProvider = () => {
    const accountInfo: any = getFromLocalStorage(accountAddressLocalStorageKey);

    if (accountInfo && accountInfo.publicKey && accountInfo.providerName) {
      if (accountInfo.providerName === "phantom") {
        if (window && "solana" in window) {
          const solanaGlobal: any = window.solana;
          if (solanaGlobal && solanaGlobal.isPhantom) {
            return solanaGlobal;
          }
        }
      } else if (accountInfo.providerName === "solflare") {
        if (window && "solflare" in window) {
          const solflareGlobal: any = window.solflare;
          if (solflareGlobal) {
            return solflareGlobal;
          }
        }
      }

      return null;
    } else {
      router.push("/connect-wallet");
    }
  };

  const sendMessage = async (
    message: string,
    to: PublicKey,
    walletProvider: any
  ) => {
    try {
      console.log("Sending message to: ", to.toBase58());
      const connection = getConnection();
      if (!connection) throw new Error("Connection not established");

      if (!walletProvider) throw new Error("Wallet provider not found");

      if (!to) throw new Error("Recipient not found");

      const lamportsToSend = 15_000;

      const ix = await LightSystemProgram.compress({
        payer: walletProvider.publicKey,
        toAddress: to,
        lamports: lamportsToSend,
        outputStateTree: defaultTestStateTreeAccounts().merkleTree,
      });

      const systemProgram = SystemProgram.transfer({
        fromPubkey: walletProvider.publicKey,
        toPubkey: to,
        lamports: lamportsToSend,
      });

      const newTransaction = new Transaction();

      newTransaction.add(ix);

      newTransaction.add(systemProgram);

      const transactionInstruction2: TransactionInstruction =
        new TransactionInstruction({
          keys: [
            {
              pubkey: walletProvider.publicKey,
              isSigner: true,
              isWritable: true,
            },
          ],
          data: Buffer.from(message, "utf-8"),
          programId: new PublicKey(memoProgramId),
        });

      // newTransaction.add(transactionInstruction1);
      newTransaction.add(transactionInstruction2);

      const latestBlockhash = await connection.getLatestBlockhash();

      newTransaction.recentBlockhash = latestBlockhash.blockhash;
      newTransaction.feePayer = walletProvider.publicKey;

      const transactionSignature =
        await walletProvider.signAndSendTransaction(newTransaction);

      const strategy: TransactionConfirmationStrategy = {
        signature: transactionSignature.signature,
        blockhash: latestBlockhash.blockhash,
        lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
      };

      await connection.confirmTransaction(strategy);

      return transactionSignature.signature;
    } catch (error) {
      console.error("Failed to send message:", error);
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

    console.log("Signatures: ", signatures);
    console.log(memoMessages);

    // signatures.forEach(async ({ signature }) => {
    //   if (signatures.length > 0) {
    //     const transactionDetails = await connection.getTransaction(signature);

    //     if (!transactionDetails) {
    //       throw new Error("Failed to fetch transaction details");
    //     }

    //     const memoInstruction =
    //       transactionDetails.transaction.message.instructions.find(
    //         (instruction) => {
    //           const programId =
    //             transactionDetails.transaction.message.accountKeys[
    //               instruction.programIdIndex
    //             ];
    //           return programId.equals(new PublicKey(memoProgramId));
    //         }
    //       );

    //     if (!memoInstruction) {
    //       throw new Error("No memo instruction found");
    //     }

    //     const senderIndex = memoInstruction.accounts[0];
    //     const senderPublicKey =
    //       transactionDetails.transaction.message.accountKeys[senderIndex];

    //     console.log("Sender Public Key: ", senderPublicKey.toBase58());

    //     // console.log("---------------------------------------------");
    //     // console.log("Sender Public Key: ", senderPublicKey.toBase58());
    //     // console.log("Memo Message: ", memoMessage);
    //     // console.log("---------------------------------------------");

    //     console.log(memoMessages);

    //     return memoMessages;
    //   }
    // });
  };

  const setListenerForPhantom = async (
    phantomProvider: any,
    connection: Connection
  ) => {
    if (phantomProvider && phantomProvider.publicKey) {
      const subId = connection.onAccountChange(
        phantomProvider.publicKey,
        async () => {
          const signatures = await connection.getSignaturesForAddress(
            phantomProvider.publicKey,
            {
              limit: 1,
            }
          );

          if (signatures && signatures.length > 0) {
            signatures.forEach(async ({ signature }) => {
              const transactionDetails =
                await connection.getTransaction(signature);

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

              const memoData = memoInstruction.data;
              const memoMessage = new TextDecoder("utf-8").decode(
                bs58.decode(memoData)
              );

              console.log("---------------------------------------------");
              console.log("Sender Public Key: ", senderPublicKey.toBase58());
              console.log("Memo Message: ", memoMessage);
              console.log("---------------------------------------------");
            });
          }
        }
      );

      setListenerSubscription(subId);
    }
  };

  const setListenerForSolflare = async (
    solflareProvider: any,
    connection: Connection
  ) => {};

  const setInitialListener = (currentProvider: any, connection: Connection) => {
    if (currentProvider && currentProvider.publicKey) {
      if (currentProvider.isPhantom) {
        setListenerForPhantom(currentProvider, connection);
      } else if (currentProvider.providerName === "solflare") {
        setListenerForSolflare(currentProvider, connection);
      }
    } else {
      router.push("/connect-wallet");
    }
  };

  useEffect(() => {
    const connection = new Connection(RPC_ENDPOINT, "confirmed");
    const currentProvider = getCurrentProvider();
    setInitialListener(currentProvider, connection);

    return () => {
      listenerSubscription &&
        connection.removeAccountChangeListener(listenerSubscription);
    };
  }, []);

  return {
    sendMessage,
    receiveMessages,
  };
};

export default useTransaction;
