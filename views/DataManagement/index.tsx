import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SentDataManagement from "../SentDataManagement";
import ReceivedFilesManagement from "../ReceivedFilesManagement";
import FileInput from "../DataTransfer/MediaTransfer/FileInput";

export default function DataManagement() {
  return (
    <Tabs defaultValue="send" className="flex flex-col gap-3">
      <Card className="border-none">
        <CardContent>
          <TabsList className="grid w-full grid-cols-3 p-0 bg-card">
            <TabsTrigger
              value="send"
              className="h-full data-[state=active]:bg-tabs-trigger"
            >
              Data Transfer
            </TabsTrigger>
            <TabsTrigger
              value="sent"
              className="h-full data-[state=active]:bg-tabs-trigger"
            >
              Messages
            </TabsTrigger>
            <TabsTrigger
              value="received"
              className="h-full data-[state=active]:bg-tabs-trigger"
            >
              My Wallet
            </TabsTrigger>
            {/* <TabsTrigger
              value="requests"
              className="h-full data-[state=active]:bg-tabs-trigger"
            >
              Requests
            </TabsTrigger> */}
          </TabsList>
        </CardContent>
      </Card>
      <Card className="border-none">
        <CardContent>
          <TabsContent value="send">
            <div className="flex flex-col gap-4">
              <div className="mt-6 flex flex-col gap-3">
                <Input placeholder="Recipient's address" />
              </div>
              <FileInput />
              <div className="flex items-center space-x-2">
                <Input type="checkbox" id="encrypt" className="w-4 h-4 ml-1" />
                <label htmlFor="encrypt" className="text-sm">
                  Encrypt data
                </label>
              </div>
              <div className="mt-4 flex justify-end">
                <Button>Send File</Button>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="sent">
            <ScrollArea className="min-h-[400px]">
              <SentDataManagement />
            </ScrollArea>
          </TabsContent>
          <TabsContent value="received">
            <ScrollArea className="min-h-[400px]">
              <ReceivedFilesManagement />
            </ScrollArea>
          </TabsContent>
          <TabsContent value="requests">
            <ScrollArea className="h-[300px]">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">RequestedFile1.pdf</p>
                    <p className="text-sm text-gray-500">From: 0x2468...1357</p>
                  </div>
                  <div className="space-x-2">
                    <Button size="sm" variant="outline">
                      Deny
                    </Button>
                    <Button size="sm">Approve</Button>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">RequestedFile2.mp4</p>
                    <p className="text-sm text-gray-500">From: 0x1357...2468</p>
                  </div>
                  <div className="space-x-2">
                    <Button size="sm" variant="outline">
                      Deny
                    </Button>
                    <Button size="sm">Approve</Button>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
        </CardContent>
      </Card>
    </Tabs>
  );
}
