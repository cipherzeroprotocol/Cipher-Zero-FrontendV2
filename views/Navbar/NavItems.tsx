import { navItems } from "./Navbar.constant";
import NavItem from "./NavItem";

export default function NavItems() {
  return (
    <ul className="flex justify-center items-center gap-8 h-20">
      {navItems.map((item) => (
        <NavItem key={item.key} item={item} />
      ))}
    </ul>
  );
}
