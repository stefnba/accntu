import NavbarMenu from './Menu';
import Search from './Search';

const Navbar = () => {
    return (
        <div className="md:flex hidden w-full px-6 py-2 border-b border-sidebar-border">
            <NavbarMenu />
        </div>
    );
};

export default Navbar;
