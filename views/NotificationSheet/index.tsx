import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { BellIcon } from "lucide-react";
import NotificationSection from "../NotificationSection";

export default function NotificationSheet() {
  return (
    <Sheet>
      <SheetTrigger>
        <BellIcon />
      </SheetTrigger>
      <SheetContent className="bg-white dark:bg-background px-0">
        <SheetHeader>
          <SheetTitle className="px-4">Notifications</SheetTitle>
        </SheetHeader>
        <div className="w-full h-[1px] bg-secondary my-4"></div>
        <NotificationSection />
      </SheetContent>
    </Sheet>
  );
}
