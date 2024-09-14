import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UploadIcon } from "lucide-react";
import SentDataManagement from "../SentDataManagement";
import ReceivedFilesManagement from "../ReceivedFilesManagement";

export default function DataManagement() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Management</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="send">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger
              value="send"
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-background"
            >
              Send
            </TabsTrigger>
            <TabsTrigger
              value="sent"
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-background"
            >
              Sent Data
            </TabsTrigger>
            <TabsTrigger
              value="received"
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-background"
            >
              Received
            </TabsTrigger>
            <TabsTrigger
              value="requests"
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-background"
            >
              Requests
            </TabsTrigger>
          </TabsList>
          <TabsContent value="send">
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-12 text-center">
              <UploadIcon className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Drag and drop files here or click to upload
              </p>
              <Button className="mt-4">
                <UploadIcon className="mr-2 h-4 w-4" /> Upload Files
              </Button>
            </div>
            <div className="mt-6 flex flex-col gap-3">
              <Input placeholder="Recipient's address" />
              <div className="flex items-center space-x-2">
                <Input type="checkbox" id="encrypt" className="w-4 h-4 ml-1" />
                <label htmlFor="encrypt" className="text-sm">
                  Encrypt data
                </label>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <Button>Send</Button>
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
        </Tabs>
      </CardContent>
    </Card>
  );
}
