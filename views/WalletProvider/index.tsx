"use client";

import PhantomWalletContextProvider from "@/contexts/PhantomWalletProvider";

export default function WalletProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PhantomWalletContextProvider>{children}</PhantomWalletContextProvider>
  );
}
