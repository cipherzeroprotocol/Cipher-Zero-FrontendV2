import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileTextIcon } from "lucide-react";
import AssetList from "./AssetList";

export default function WalletManagement() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Asset Management</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="coins">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger
              value="coins"
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-background"
            >
              Coins
            </TabsTrigger>
            <TabsTrigger
              value="nfts"
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-background"
            >
              NFTs
            </TabsTrigger>
          </TabsList>
          <TabsContent value="coins">
            <AssetList />
          </TabsContent>
          <TabsContent value="nfts">
            <div className="grid grid-cols-3 gap-2">
              <div className="aspect-square bg-gray-200 rounded flex items-center justify-center">
                <FileTextIcon className="text-gray-400" />
              </div>
              <div className="aspect-square bg-gray-200 rounded flex items-center justify-center">
                <FileTextIcon className="text-gray-400" />
              </div>
              <div className="aspect-square bg-gray-200 rounded flex items-center justify-center">
                <FileTextIcon className="text-gray-400" />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
