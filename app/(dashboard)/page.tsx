import FeatureTabs from "@/views/FeatureTabs";

export default function Home() {
  return (
    <>
      <div className="grid mt-8 grid-cols-12 gap-8">
        <div className="col-span-12 xl:col-span-12">
          <FeatureTabs />
        </div>
        {/* <div className="col-span-12 xl:col-span-4">
          <WalletManagement />
        </div> */}
      </div>
    </>
  );
}
