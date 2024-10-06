import Image from "next/image";
import useMessageDetailLogic from "./MessageDetail.logic";
import { IMessageDetailProps } from "./MessageDetail.model";
import MessageDetailHeader from "./MessageDetailHeader";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useWallet } from "@/hooks/useWallet";
import InputSearch from "@/views/common/InputSearch";
import { Button } from "@/components/ui/button";
import { CopyIcon, SendHorizonalIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import copyToClipboard from "@/helpers/copyToClipboard";
import useTransaction from "@/hooks/use-transaction";
import { useEffect, useState } from "react";
import { PublicKey } from "@solana/web3.js";
import { useRouter } from "next/navigation";

//const fromSecretKeyStr =
//   "LecBDkkrpWZWiokBwFFWavLWwgUaBDLc4ceAXFiV6VA33oMCdoXqs7mSp38z1Dyjac5pgeaJH2EF4z8ExnrSUgM";

// const fromKeypairArray = bs58.decode(fromSecretKeyStr);

export default function MessageDetail({
  selectedAccount,
  handleGoBack,
}: IMessageDetailProps) {
  const { messageDetailList } = useMessageDetailLogic();
  const { publicKey, walletProvider } = useWallet();
  // const { compressData } = useCompression();
  const [message, setMessage] = useState<string>("");

  const { sendMessage } = useTransaction();

  const { toast } = useToast();

  const router = useRouter();

  const handleCopyTransactionId = (txId: string) => {
    copyToClipboard(txId);
  };

  const handleSendMessage = async () => {
    try {
      if (message === "") {
        return;
      }

      if (!walletProvider) {
        toast({
          title: "Connect Wallet",
          description:
            "Wallet connection not found! Please connect your wallet to send a message.",
          duration: 5000,
        });
        router.push("/connect-wallet");
      }

      const to: PublicKey = new PublicKey(selectedAccount);

      const txId = await sendMessage(message, to, walletProvider);

      if (txId) {
        toast({
          title: "Transaction ID",
          description: (
            <div className="flex gap-3">
              <span className="text-primary">
                {txId.split("").splice(0, 20).join("") +
                  "..." +
                  txId.split("").splice(-20).join("")}
              </span>
              <CopyIcon
                className="cursor-pointer"
                onClick={() => handleCopyTransactionId(txId)}
              />
            </div>
          ),
          duration: 20000,
        });
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const acquireMessages = () => {
    try {
      if (selectedAccount && publicKey) {
        const own: PublicKey = new PublicKey(publicKey);
        const to: PublicKey = new PublicKey(selectedAccount);
        // receiveMessages(own, to);
      }
    } catch (error) {
      console.error("Failed to receive message:", error);
    }
  };

  useEffect(() => {
    acquireMessages();
  }, [selectedAccount, publicKey]);

  if (!publicKey) {
    return null;
  }

  return (
    <section>
      <MessageDetailHeader
        handleGoBack={handleGoBack}
        selectedAccount={selectedAccount}
      />
      <ScrollArea className="h-80">
        <ul className="flex flex-col gap-6 p-6">
          {messageDetailList.map((messageDetail, index) => (
            <li key={index} className="flex items-start gap-3">
              {publicKey !== messageDetail.owner ? (
                <>
                  <Image
                    src="/images/avatar-fallback.png"
                    alt="avatar.png"
                    width={32}
                    height={32}
                  />

                  <div className="flex flex-col gap-2">
                    <p className="text-xs font-semibold">
                      {messageDetail.owner.split("").splice(0, 5).join("")}...
                      {messageDetail.owner.split("").splice(-5).join("")}
                    </p>
                    <div className="flex items-center gap-1">
                      <div className="px-4 py-1 w-fit rounded-lg bg-tabs-trigger">
                        {messageDetail.message}
                      </div>
                      <span className="text-xs font-semibold text-tabs-trigger-foreground">
                        {messageDetail.passedTime}
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="w-full flex items-center justify-end gap-2">
                  <span className="text-xs font-semibold text-tabs-trigger-foreground">
                    {messageDetail.passedTime}
                  </span>
                  <p className="bg-primary px-4 py-1 rounded-lg">
                    {messageDetail.message}
                  </p>
                </div>
              )}
            </li>
          ))}
        </ul>
      </ScrollArea>
      <div className="flex items-center gap-4 py-4 mt-4">
        <InputSearch
          placeholder="Enter your message..."
          onSearch={(value: string) => setMessage(value)}
          showSearchIcon={false}
          className="flex-1"
        />
        <Button
          size="icon"
          disabled={message === ""}
          onClick={handleSendMessage}
        >
          <SendHorizonalIcon className="h-4 w-4" />
        </Button>
      </div>
    </section>
  );
}
