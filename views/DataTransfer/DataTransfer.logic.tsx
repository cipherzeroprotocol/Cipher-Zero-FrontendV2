import { IFeatureTabItem } from "./DataTransfer.model";

const useDataTransferLogic = () => {
  const dataTransferTabs: IFeatureTabItem[] = [
    {
      value: "media",
      label: "Media",
    },
    {
      value: "token",
      label: "Token",
    },
    {
      value: "nft",
      label: "NFT",
    },
  ];

  return { dataTransferTabs };
};

export default useDataTransferLogic;
