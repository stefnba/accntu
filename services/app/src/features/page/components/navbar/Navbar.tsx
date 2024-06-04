import NavbarMenu from './Menu';
import Logo from './Logo';
import Search from './Search';
import { SidebarToggle } from './SidebarToggle';

const Navbar = () => {
    return (
        <div className="fixed inset-y-0 z-50 flex h-[75px] w-full items-center justify-center border-b bg-white px-4 shadow-sm">
            <SidebarToggle />
            <Logo />
            {/* <Search /> */}
            <NavbarMenu />
        </div>
    );
};

export default Navbar;
