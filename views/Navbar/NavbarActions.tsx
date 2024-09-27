"use client";

import ConnectWallet from "../ConnectWallet";
import DisconnectWallet from "../DisconnectWallet";
import { useWallet } from "@/hooks/useWallet";
// import MessagesSheet from "../MessagesSheet";
// import NotificationSheet from "../NotificationSheet";

export default function NavbarActions() {
  const { isConnected, publicKey } = useWallet();

  return isConnected && publicKey ? (
    <div className="flex items-center gap-8">
      {/* <MessagesSheet /> */}
      {/* <NotificationSheet /> */}
      <DisconnectWallet />
    </div>
  ) : (
    <ConnectWallet />
  );
}
