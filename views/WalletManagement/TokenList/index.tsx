"use client";

import Image from "next/image";
import useTokenListLogic from "./TokenList.logic";
import InputSearch from "@/views/common/InputSearch";

export default function AssetList() {
  const { tokenList, handleTokenSearch } = useTokenListLogic();

  return (
    <div className="flex flex-col gap-4 py-4">
      <InputSearch placeholder="Search token" onSearch={handleTokenSearch} />
      <ul className="flex flex-col px-4">
        {tokenList.map((token) => (
          <li key={token.key} className="py-4">
            <div className="flex justify-between items-center">
              <div className="flex gap-4">
                <Image
                  src={token.iconSrc}
                  alt={token.name}
                  width={24}
                  height={24}
                />
                <span>{token.symbol}</span>
              </div>
              <span>{token.balance}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
