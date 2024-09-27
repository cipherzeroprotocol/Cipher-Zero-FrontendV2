import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TokenList from "./TokenList";
import useWalletManagementLogic from "./WalletManagement.logic";
import NFTList from "./NFTList";

export default function WalletManagement() {
  const { walletManagementTabs } = useWalletManagementLogic();

  return (
    <>
      <Tabs defaultValue={walletManagementTabs[0].value} className="p-4">
        <TabsList className="grid w-full grid-cols-8 p-0 bg-card">
          {walletManagementTabs.map((tabItem) => {
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
        <TabsContent value={walletManagementTabs[0].value}>
          <TokenList />
        </TabsContent>
        <TabsContent value={walletManagementTabs[1].value}>
          <NFTList />
        </TabsContent>
      </Tabs>
    </>
  );
}
