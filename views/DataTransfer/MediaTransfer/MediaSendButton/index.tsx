import { Button } from "@/components/ui/button";

export default function MediaSendButton() {
  return (
    <div className="flex justify-between items-center bg-tabs-trigger rounded-lg p-5">
      <div className="flex flex-col items-center font-semibold text-muted-foreground">
        <p>Total Cost</p>
        <p>0,0</p>
      </div>
      <Button className="btn-primary" size="lg">
        Send File
      </Button>
    </div>
  );
}
