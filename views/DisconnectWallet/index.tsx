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
        <Button variant="outline">
          {publicKey ? formatPublicKey(publicKey) : "No address"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={handleDisconnect}>
            Disconnect
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={handleCopyAddress}>
            Copy address
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
