import NavbarMenu from './Menu';
import Search from './Search';

const Navbar = () => {
    return (
        <div className="pl-9 md:block hidden absolute right-10 top-4 ">
            <div className="flex z-50">
                <NavbarMenu />
            </div>
        </div>
    );
};

export default Navbar;
