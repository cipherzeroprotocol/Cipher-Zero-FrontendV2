"use client";

import Image from "next/image";
import useNFTListLogic from "./NFTList.logic";
import InputSearch from "@/views/common/InputSearch";

export default function NFTList() {
  const { collectionList, handleCollectionSearch } = useNFTListLogic();

  return (
    <div className="flex flex-col gap-4 py-4">
      <InputSearch
        placeholder="Search token"
        onSearch={handleCollectionSearch}
      />
      <ul className="flex flex-col px-4">
        {collectionList.map((collection) => (
          <li key={collection.key} className="py-6">
            <div className="flex gap-4 items-center">
              {collection.iconSrc ? (
                <Image
                  src={collection.iconSrc}
                  alt={collection.name}
                  width={32}
                  height={32}
                />
              ) : (
                <Image
                  src="/images/nft-image-fallback.png"
                  alt={collection.name}
                  width={32}
                  height={32}
                />
              )}
              <div className="flex gap-1 items-center">
                <span>{collection.name}</span>
                <span className="text-primary">{collection.key}</span>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
