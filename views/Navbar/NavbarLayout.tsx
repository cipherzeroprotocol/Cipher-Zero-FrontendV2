export default function NavbarLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <nav className="border-b">{children}</nav>;
}
