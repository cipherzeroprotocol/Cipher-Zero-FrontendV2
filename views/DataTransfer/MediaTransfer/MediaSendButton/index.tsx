import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function MediaSendButton() {
  return (
    <div className="flex justify-between items-center bg-tabs-trigger rounded-lg p-5">
      <div className="flex flex-col">
        <p className="text-tabs-trigger-foreground font-semibold text-sm">
          Total Cost
        </p>
        <div className="flex">
          <Image
            src="/images/solana-orange.png"
            alt="solana-orange"
            width={20}
            height={20}
          />
          <p>0,0</p>
        </div>
      </div>
      <Button className="btn-primary" size="lg">
        Send File
      </Button>
    </div>
  );
}
