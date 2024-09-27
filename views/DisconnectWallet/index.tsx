import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import copyToClipboard from "@/helpers/copyToClipboard";
import { useWallet } from "@/hooks/useWallet";
import { ChevronDown, CopyIcon, LogOutIcon } from "lucide-react";

export default function DisconnectWallet() {
  const { disconnectWallet, publicKey } = useWallet();

  const formatPublicKey = (publicKey: string) => {
    return `${publicKey.slice(0, 5)}...${publicKey.slice(-5)}`;
  };

  const handleCopyAddress = () => {
    if (publicKey) {
      copyToClipboard(publicKey);
    }
  };

  const handleDisconnect = () => {
    disconnectWallet();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="flex gap-2 bg-card hover:bg-tabs-trigger border-tabs-trigger rounded-xl"
        >
          {publicKey ? formatPublicKey(publicKey) : "No address"}
          <ChevronDown size={16} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-card">
        <DropdownMenuGroup className="space-y-2">
          <DropdownMenuItem
            onClick={handleDisconnect}
            className="focus:bg-tabs-trigger space-x-2"
          >
            <LogOutIcon />
            <span className="font-semibold">Disconnect</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={handleCopyAddress}
            className="focus:bg-tabs-trigger space-x-2"
          >
            <CopyIcon />
            <span className="font-semibold">Copy address</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
