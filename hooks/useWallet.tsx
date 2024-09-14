import {
  getFromLocalStorage,
  saveToLocalStorage,
} from "@/helpers/localStorageHelper";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useToast } from "./use-toast";

export type AvailableChains = "solana" | "ethereum";

interface WalletHookReturnType {
  isConnecting: boolean;
  isConnected: boolean;
  connectWallet: (chain: AvailableChains) => void;
  disconnectWallet: () => void;
  publicKey: string | null;
}

const accountAddressLocalStorageKey = "cipher-zero-account-address";

export const useWallet = (): WalletHookReturnType => {
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [provider, setProvider] = useState<any>(null);

  const router = useRouter();
  const { toast } = useToast();

  const isConnected = () => {
    const hasPublicKey = getFromLocalStorage(accountAddressLocalStorageKey);
    return !!hasPublicKey;
  };

  const connectSolanaAccount = async () => {
    if (provider && provider.isPhantom) {
      try {
        const response = await provider.connect();
        if (response) {
          saveToLocalStorage(
            accountAddressLocalStorageKey,
            response.publicKey.toString()
          );
          router.push("/");
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsConnecting(false);
      }
    }
  };

  const connectWallet = async (chain: AvailableChains) => {
    setIsConnecting(true);
    if (chain === "solana") {
      await connectSolanaAccount();
    }
  };

  const disconnectWallet = async () => {
    if (provider && provider.isPhantom) {
      try {
        await provider.disconnect();
        localStorage.removeItem(accountAddressLocalStorageKey);
        router.push("/connect-wallet");
      } catch (error) {
        console.error(error);
      }
    }
  };

  const getPublicKey = () => {
    const publicKey = getFromLocalStorage(
      accountAddressLocalStorageKey
    ) as string;
    return publicKey;
  };

  useEffect(() => {
    if ("solana" in window) {
      const provider: any = window.solana;
      if (provider && provider.isPhantom) {
        setProvider(provider);
      }
    }
  }, []);

  useEffect(() => {
    if (!isConnected()) {
      router.push("/connect-wallet");
      toast({
        title: "Please connect your wallet",
        description: "You need to connect your wallet to continue",
        variant: "destructive",
      });
    }
  }, [router, toast]);

  return {
    isConnecting,
    isConnected: isConnected(),
    connectWallet,
    disconnectWallet,
    publicKey: getPublicKey(),
  };
};
