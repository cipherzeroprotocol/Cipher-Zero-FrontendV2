import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useDataTransferLogic from "./DataTransfer.logic";
import MediaTransfer from "./MediaTransfer";

export default function DataTransfer() {
  const { dataTransferTabs } = useDataTransferLogic();
  return (
    <>
      <Tabs defaultValue={dataTransferTabs[0].value} className="p-4">
        <TabsList className="grid w-full grid-cols-8 p-0 bg-card">
          {dataTransferTabs.map((tabItem) => {
            return (
              <TabsTrigger
                key={tabItem.value}
                value={tabItem.value}
                className="h-full data-[state=active]:bg-tabs-trigger rounded-xl text-tabs-trigger-foreground"
              >
                {tabItem.label}
              </TabsTrigger>
            );
          })}
        </TabsList>
        <TabsContent value="media">
          <MediaTransfer />
        </TabsContent>
      </Tabs>
      {/* <div className="flex flex-col gap-4">
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
      </div> */}
    </>
  );
}
