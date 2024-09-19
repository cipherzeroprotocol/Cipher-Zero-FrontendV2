import { IFeatureTabItem } from "./FeatureTabs.model";

const useFeatureTabsLogic = () => {
  const featureTabs: IFeatureTabItem[] = [
    { value: "data_transfer", label: "Data Transfer" },
    { value: "messages", label: "Messages" },
    { value: "my_wallet", label: "My Wallet" },
  ];

  return { featureTabs };
};

export default useFeatureTabsLogic;
