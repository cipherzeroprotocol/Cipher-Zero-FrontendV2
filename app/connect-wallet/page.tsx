import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ConnectWallet from "@/views/ConnectWallet";

export default function ConnectWalletPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">
            Welcome to CipherZero
          </CardTitle>
          <CardDescription>Connect your wallet to get started</CardDescription>
        </CardHeader>
        <CardContent className="px-8">
          <ConnectWallet />
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
            Your data is secure and encrypted. We prioritize privacy and
            decentralized security.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
