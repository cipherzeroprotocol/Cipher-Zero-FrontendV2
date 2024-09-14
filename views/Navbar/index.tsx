import NavbarActions from "./NavbarActions";
import NavbarLayout from "./NavbarLayout";
import NavbarLogo from "./NavbarLogo";
// import NavItems from "./NavItems";

export default function Navbar() {
  return (
    <NavbarLayout>
      <div className="container mx-auto flex items-center justify-between h-20">
        <NavbarLogo />
        {/* <NavItems /> */}
        <NavbarActions />
      </div>
    </NavbarLayout>
  );
}
