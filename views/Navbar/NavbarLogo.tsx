import Image from "next/image";

export default function NavbarLogo() {
  return (
    <div className="flex items-center gap-2">
      <Image src="/images/logo.png" alt="Logo" width={24} height={24} />
      <Image
        src="/images/logo-text.png"
        alt="Logo-text"
        width={128}
        height={0}
      />
    </div>
  );
}
