import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useFeatureTabsLogic from "./FeatureTabs.logic";
import DataTransfer from "../DataTransfer";
import MessageTransfer from "../MessageTransfer";
import WalletManagement from "../WalletManagement";

export default function FeatureTabs() {
  const { featureTabs } = useFeatureTabsLogic();

  return (
    <Tabs
      defaultValue="data_transfer"
      className="flex flex-col gap-3 max-w-app-container-max mx-auto"
    >
      <Card className="border-none">
        <CardContent>
          <TabsList className="grid w-full grid-cols-3 p-0 bg-card">
            {featureTabs.map((tabItem) => {
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
        </CardContent>
      </Card>
      <Card className="border-none">
        <CardContent>
          <TabsContent value="data_transfer">
            <DataTransfer />
          </TabsContent>
          <TabsContent value="messages">
            <ScrollArea className="min-h-[400px]">
              <MessageTransfer />
            </ScrollArea>
          </TabsContent>
          <TabsContent value="my_wallet">
            <ScrollArea className="min-h-[400px]">
              <WalletManagement />
            </ScrollArea>
          </TabsContent>
        </CardContent>
      </Card>
    </Tabs>
  );
}
