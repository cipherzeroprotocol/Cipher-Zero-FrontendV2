import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { MessageSquareIcon } from "lucide-react";
import MessagesSection from "../MessagesSection";

export default function MessagesSheet() {
  return (
    <Sheet>
      <SheetTrigger>
        <MessageSquareIcon />
      </SheetTrigger>
      <SheetContent className="bg-white dark:bg-background">
        <SheetHeader>
          <SheetTitle>Messages</SheetTitle>
          <SheetDescription>Send messages to your friends.</SheetDescription>
        </SheetHeader>
        <div className="w-full h-[1px] bg-secondary my-4"></div>
        <MessagesSection />
      </SheetContent>
    </Sheet>
  );
}
