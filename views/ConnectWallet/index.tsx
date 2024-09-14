"use client";

import { Button } from "@/components/ui/button";
import { useWallet } from "@/hooks/useWallet";
import { Wallet2Icon } from "lucide-react";

export default function ConnectWallet() {
  const { connectWallet, isConnecting } = useWallet();

  const handleToggleConnect = () => {
    connectWallet("solana");
  };

  return (
    <Button
      onClick={handleToggleConnect}
      disabled={isConnecting}
      className="w-full"
    >
      <Wallet2Icon className="mr-2 h-5 w-5" />
      <span>{isConnecting ? "Connecting..." : "Connect"}</span>
    </Button>
  );
}
