import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SendIcon } from "lucide-react";

export default function MessagesSection() {
  return (
    <div className="flex flex-col justify-between gap-4 h-[85vh]">
      <ScrollArea>
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarImage src="/placeholder-avatar.jpg" alt="User" />
              <AvatarFallback>U1</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">User 1</p>
              <p className="text-xs text-gray-500">Hello there!</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarImage src="/placeholder-avatar.jpg" alt="User" />
              <AvatarFallback>U2</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">User 2</p>
              <p className="text-xs text-gray-500">Can you send me the file?</p>
            </div>
          </div>
        </div>
      </ScrollArea>
      <div className="flex w-full space-x-2">
        <Input placeholder="Type a message..." />
        <Button size="icon">
          <SendIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
