"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useWallet } from "@/hooks/useWallet";
import { Wallet2Icon } from "lucide-react";
import Image from "next/image";

export default function ConnectWallet() {
  const { connectWallet, isConnecting } = useWallet();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button disabled={isConnecting} className="w-full">
          <Wallet2Icon className="mr-2 h-5 w-5" />
          <span>{isConnecting ? "Connecting..." : "Connect"}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="w-fit">
        <div className="flex flex-col gap-4 w-fit p-4">
          <Button
            variant="outline"
            className="px-0 flex gap-4 w-fit"
            size="lg"
            onClick={() => connectWallet("solana", "phantom")}
          >
            <Image
              alt="phantom-logo"
              src="/images/phantom-icon.png"
              width={32}
              height={32}
            />
            <span className="pr-2">Connect to Phantom</span>
          </Button>
          <Button
            variant="outline"
            className="px-0 flex gap-4 w-fit"
            size="lg"
            onClick={() => connectWallet("solana", "solflare")}
          >
            <Image
              alt="phantom-logo"
              src="/images/solflare-logo.jpg"
              width={32}
              height={32}
            />
            <span className="pr-2">Connect to Solflare</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
