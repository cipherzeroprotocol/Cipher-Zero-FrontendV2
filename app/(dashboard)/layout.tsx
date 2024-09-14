import AppLayout from "@/views/layouts/AppLayout";
import Navbar from "@/views/Navbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppLayout>
      <header>
        <Navbar />
      </header>
      <main className="container mx-auto px-4">{children}</main>
    </AppLayout>
  );
}
