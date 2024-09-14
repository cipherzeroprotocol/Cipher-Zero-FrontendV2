"use client";

import copyToClipboard from "@/helpers/copyToClipboard";
import { CopyIcon } from "lucide-react";

export default function TableFromCell({ value }: { value: string }) {
  const handleCopy = () => {
    copyToClipboard(value);
  };

  return (
    <div className="flex gap-3">
      <span>{value}</span>
      <CopyIcon
        className="ml-2 h-4 w-4 text-gray-400 cursor-pointer"
        onClick={handleCopy}
      />
    </div>
  );
}
