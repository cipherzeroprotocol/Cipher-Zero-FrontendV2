import FeatureTabs from "@/views/FeatureTabs";
import WalletManagement from "@/views/WalletManagement";

export default function Home() {
  return (
    <>
      <div className="grid mt-8 grid-cols-12 grid-rows-2 gap-8">
        <div className="col-span-12 xl:col-span-8">
          <FeatureTabs />
        </div>
        <div className="col-span-12 xl:col-span-4">
          <WalletManagement />
        </div>
      </div>
    </>
  );
}
