import Link from "next/link";
import { INavItemProps } from "./Navbar.model";

export default function NavItem({ item }: INavItemProps) {
  return (
    <Link href={item.href} legacyBehavior>
      <li className="font-semibold text-font-primary hover:text-font-primary-hover cursor-pointer">
        <p className="">{item.title}</p>
      </li>
    </Link>
  );
}
