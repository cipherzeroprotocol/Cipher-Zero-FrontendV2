import { useMemo, useState } from "react";
import { INFTListItem } from "./NFTList.model";

const useNFTListLogic = () => {
  const [searchText, setSearchText] = useState<string>("");

  const handleCollectionSearch = (searchText: string) => {
    setSearchText(searchText);
  };

  const collectionList: INFTListItem[] = useMemo(() => {
    const collections = [
      {
        key: "#9959",
        name: "CryptoPunks",
        iconSrc: "",
      },
      {
        key: "#9435",
        name: "DeGods",
        iconSrc: "",
      },
      {
        key: "#1234",
        name: "Bored Ape Yacht Club",
        iconSrc: "",
      },
      {
        key: "#1235",
        name: "Art Blocks",
        iconSrc: "",
      },
    ];

    if (searchText) {
      return collections.filter(
        (collection) =>
          collection.name.toLowerCase().includes(searchText.toLowerCase()) ||
          collection.key.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    return collections;
  }, [searchText]);

  return { collectionList, handleCollectionSearch };
};

export default useNFTListLogic;
