export default function NavbarLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <nav>{children}</nav>;
}
