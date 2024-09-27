"use client";

import Image from "next/image";
import useMessageListLogic from "./MessageList.logic";
import { IMessageListProps } from "./MessageList.model";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function MessageList({
  searchText,
  onSelectMessage,
}: IMessageListProps) {
  const { messageList } = useMessageListLogic({ searchText });
  return (
    <ScrollArea className="h-[544px] my-6">
      <ul className="space-y-8 px-2">
        {messageList.map((messageItem) => (
          <li
            className="flex justify-between cursor-pointer"
            key={messageItem.publicKey}
            onClick={() => onSelectMessage(messageItem.publicKey)}
          >
            <div className="flex gap-3">
              <Image
                src="/images/avatar-fallback.png"
                alt="User"
                width={40}
                height={40}
              />
              <div className="flex flex-col justify-between">
                <h3 className="text-sm font-semibold">
                  {messageItem.publicKey.split("").slice(0, 5).join("")}
                  ...
                  {messageItem.publicKey.split("").slice(-5).join("")}
                </h3>
                <p className="text-xs text-tabs-trigger-foreground">
                  {messageItem.lastMessage}
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <p
                className={`text-xs ${messageItem.unreadMessages > 0 ? "text-primary" : ""}`}
              >
                {messageItem.lastMessageDate}
              </p>
              {messageItem.unreadMessages > 0 && (
                <div className="bg-primary w-4 h-4 rounded-full text-xs flex items-center justify-center self-end">
                  {messageItem.unreadMessages}
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </ScrollArea>
  );
}
