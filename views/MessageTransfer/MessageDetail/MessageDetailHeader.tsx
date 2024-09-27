"use client";

import { Card, CardContent } from "@/components/ui/card";
import copyToClipboard from "@/helpers/copyToClipboard";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeftIcon, CopyIcon } from "lucide-react";
import Image from "next/image";

interface IMessageDetailHeaderProps {
  selectedAccount: string;
  handleGoBack: () => void;
}

export default function MessageDetailHeader({
  selectedAccount,
  handleGoBack,
}: IMessageDetailHeaderProps) {
  const { toast } = useToast();

  const handleCopy = () => {
    try {
      copyToClipboard(selectedAccount);
      toast({
        description: "Address copied to clipboard",
        duration: 1000,
      });
    } catch (error) {
      console.error("Failed to copy", error);
    }
  };

  const goBack = () => {
    handleGoBack();
  };

  return (
    <Card className="border-none bg-tabs-trigger">
      <CardContent className="flex items-center gap-3">
        <ChevronLeftIcon className="cursor-pointer" onClick={goBack} />
        <Image
          src="/images/avatar-fallback.png"
          alt="avatar-fallback"
          width={32}
          height={32}
        />
        <h3 className="text-sm font-semibold">
          {selectedAccount.split("").slice(0, 5).join("")}...
          {selectedAccount.split("").slice(-5).join("")}
        </h3>
        <CopyIcon className="cursor-pointer" size={12} onClick={handleCopy} />
      </CardContent>
    </Card>
  );
}
