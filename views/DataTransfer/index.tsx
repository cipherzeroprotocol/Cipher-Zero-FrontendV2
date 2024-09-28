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
    </>
  );
}
