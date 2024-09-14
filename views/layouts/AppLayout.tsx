"use client";

import { useWallet } from "@/hooks/useWallet";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { isConnected } = useWallet();

  if (!isConnected) {
    return null;
  }

  return <>{children}</>;
}
