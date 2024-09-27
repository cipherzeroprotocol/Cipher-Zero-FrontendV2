import { useMemo } from "react";
import { IWalletManagementTabItem } from "./WalletManagement.model";

const useWalletManagementLogic = () => {
  const walletManagementTabs: IWalletManagementTabItem[] = useMemo(() => {
    return [
      {
        value: "token",
        label: "Token",
      },
      {
        value: "nft",
        label: "NFT",
      },
    ];
  }, []);

  return { walletManagementTabs };
};

export default useWalletManagementLogic;
