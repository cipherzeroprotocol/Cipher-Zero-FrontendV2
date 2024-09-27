import { useMemo, useState } from "react";
import { ITokenListItem } from "./TokenList.model";

const useTokenListLogic = () => {
  const [searchText, setSearchText] = useState<string>("");

  const handleTokenSearch = (searchText: string) => {
    setSearchText(searchText);
  };

  const tokenList: ITokenListItem[] = useMemo(() => {
    const tokenItems = [
      {
        key: "SOL",
        name: "Solana",
        symbol: "SOL",
        balance: 12.345,
        iconSrc: "https://cryptologos.cc/logos/solana-sol-logo.png",
      },
      {
        key: "ETH",
        name: "Ethereum",
        symbol: "ETH",
        balance: 1.234,
        iconSrc: "https://cryptologos.cc/logos/ethereum-eth-logo.png",
      },
      {
        key: "BTC",
        name: "Bitcoin",
        symbol: "BTC",
        balance: 0.0056,
        iconSrc: "https://cryptologos.cc/logos/bitcoin-btc-logo.png",
      },
      {
        key: "USDT",
        name: "Tether",
        symbol: "USDT",
        balance: 100.0,
        iconSrc: "https://cryptologos.cc/logos/tether-usdt-logo.png",
      },
      {
        key: "USDC",
        name: "USD Coin",
        symbol: "USDC",
        balance: 100.0,
        iconSrc: "https://cryptologos.cc/logos/usd-coin-usdc-logo.png",
      },
    ];

    if (searchText) {
      return tokenItems.filter((asset) =>
        asset.symbol.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    return tokenItems;
  }, [searchText]);

  return { tokenList, handleTokenSearch };
};

export default useTokenListLogic;
