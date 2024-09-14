import Image from "next/image";
import { assetList } from "./AssetList.mock";

export default function AssetList() {
  return (
    <ul className="flex flex-col py-4 px-4">
      {assetList.map((asset) => (
        <li key={asset.key} className="border-t border-b border-secondary py-4">
          <div className="flex justify-between items-center">
            <div className="flex gap-4">
              <Image
                src={asset.iconSrc}
                alt={asset.name}
                width={24}
                height={24}
              />
              <span>{asset.symbol}</span>
            </div>
            <span>{asset.balance}</span>
          </div>
        </li>
      ))}
    </ul>
  );
}
