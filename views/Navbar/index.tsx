import NavbarActions from "./NavbarActions";
import NavbarLayout from "./NavbarLayout";
import NavbarLogo from "./NavbarLogo";
// import NavItems from "./NavItems";

export default function Navbar() {
  return (
    <NavbarLayout>
      <div className="container mx-auto px-3 flex items-center justify-between h-20 max-w-app-container-max">
        <NavbarLogo />
        {/* <NavItems /> */}
        <NavbarActions />
      </div>
    </NavbarLayout>
  );
}
