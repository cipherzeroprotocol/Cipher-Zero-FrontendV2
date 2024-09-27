"use client";

import { Toaster } from "@/components/ui/toaster";
import { useWallet } from "@/hooks/useWallet";
import useZkCompression from "@/hooks/useZkCompression";
import { useEffect } from "react";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { isConnected } = useWallet();
  const { createConnection } = useZkCompression();

  useEffect(() => {
    createConnection();
  }, []);

  if (!isConnected) {
    return null;
  }

  return (
    <>
      {children}
      <Toaster />
    </>
  );
}
