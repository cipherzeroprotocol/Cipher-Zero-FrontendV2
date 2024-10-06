import {
  getFromLocalStorage,
  saveToLocalStorage,
} from "@/helpers/localStorageHelper";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export type AvailableChains = "solana" | "ethereum";

export type WalletProvider = "phantom" | "solflare";

interface WalletHookReturnType {
  isConnecting: boolean;
  isConnected: boolean;
  connectWallet: (
    chain: AvailableChains,
    walletProvider: WalletProvider
  ) => void;
  disconnectWallet: () => void;
  publicKey: string | null;
  walletProvider: any;
}

const accountAddressLocalStorageKey = "cipher-zero-account-info";

export const useWallet = (): WalletHookReturnType => {
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [phantomProvider, setPhantomProvider] = useState<any>(null);
  const [solflareProvider, setSolflareProvider] = useState<any>(null);

  const router = useRouter();

  const isConnected = () => {
    const accountInfo: any = getFromLocalStorage(accountAddressLocalStorageKey);
    return accountInfo && accountInfo.publicKey ? true : false;
  };

  const setInitialConnection = async (
    phantomProviderInstance: any,
    solflareProviderInstance: any
  ) => {
    const accountInfo: any = getFromLocalStorage(accountAddressLocalStorageKey);
    if (
      accountInfo &&
      accountInfo.providerName === "phantom" &&
      phantomProviderInstance
    ) {
      await phantomProviderInstance.connect();
    } else if (
      accountInfo &&
      accountInfo.providerName === "solflare" &&
      solflareProviderInstance
    ) {
      await solflareProviderInstance.connect();
    } else {
      router.push("/connect-wallet");
    }
  };

  const connectToPhantom = async () => {
    try {
      if (phantomProvider) {
        const response = await phantomProvider.connect();
        if (response) {
          const accountInfo = {
            publicKey: response.publicKey.toString(),
            providerName: "phantom",
          };

          saveToLocalStorage(accountAddressLocalStorageKey, accountInfo);
          router.push("/");
        }
      } else {
        throw new Error("Phantom provider not found");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsConnecting(false);
      setSolflareProvider(null);
    }
  };

  const connectToSolflare = async () => {
    try {
      if (solflareProvider) {
        const isConnected = await solflareProvider.connect();

        if (isConnected && solflareProvider.isConnected) {
          const pubKey = solflareProvider.publicKey;
          const accountInfo = {
            publicKey: pubKey.toString(),
            providerName: "solflare",
          };
          saveToLocalStorage(accountAddressLocalStorageKey, accountInfo);
          router.push("/");
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsConnecting(false);
      setPhantomProvider(null);
    }
  };

  const connectSolanaAccount = async (providerName: WalletProvider) => {
    if (providerName === "phantom") {
      connectToPhantom();
    } else if (providerName === "solflare") {
      connectToSolflare();
    }
  };

  const connectWallet = async (
    chain: AvailableChains,
    walletProvider: WalletProvider
  ) => {
    setIsConnecting(true);
    if (chain === "solana") {
      await connectSolanaAccount(walletProvider);
    }
  };

  const disconnectWallet = async () => {
    if (phantomProvider) {
      try {
        await phantomProvider.disconnect();
        localStorage.removeItem(accountAddressLocalStorageKey);
        router.push("/connect-wallet");
      } catch (error) {
        console.error(error);
      } finally {
        setIsConnecting(false);
      }
    }

    if (solflareProvider) {
      try {
        await solflareProvider.disconnect();
        localStorage.removeItem(accountAddressLocalStorageKey);
        router.push("/connect-wallet");
      } catch (error) {
        console.error(error);
      } finally {
        setIsConnecting(false);
      }
    }
  };

  const getCurrentProvider = () => {
    const accountInfo: any = getFromLocalStorage(accountAddressLocalStorageKey);

    if (accountInfo && accountInfo.providerName === "phantom") {
      return phantomProvider;
    } else if (accountInfo && accountInfo.providerName === "solflare") {
      return solflareProvider;
    }
  };

  const getPublicKey = () => {
    const accountInfo: any = getFromLocalStorage(
      accountAddressLocalStorageKey
    ) as string;
    return accountInfo?.publicKey || null;
  };

  useEffect(() => {
    let phantomInstance: any = null;
    let solflareInstance: any = null;

    if (window && "solana" in window) {
      const solanaGlobal: any = window.solana;
      if (solanaGlobal && solanaGlobal.isPhantom) {
        phantomInstance = solanaGlobal;
      }
    }

    if (window && "solflare" in window) {
      const solflareGlobal: any = window.solflare;
      if (solflareGlobal) {
        solflareInstance = solflareGlobal;
      }
    }

    if (phantomInstance || solflareInstance) {
      setInitialConnection(phantomInstance, solflareInstance);
    }

    setPhantomProvider(phantomInstance);
    setSolflareProvider(solflareInstance);
  }, []);

  return {
    isConnecting,
    isConnected: isConnected(),
    connectWallet,
    disconnectWallet,
    publicKey: getPublicKey(),
    walletProvider: getCurrentProvider(),
  };
};
