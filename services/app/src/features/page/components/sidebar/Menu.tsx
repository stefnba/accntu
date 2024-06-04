'use client';
import routes from '../routes';
import SidebarNavItem from './NavItem';

const SidebarMenu = () => {
    return (
        <div className="flex flex-col space-y-2 px-3">
            {routes.map((route) => (
                <SidebarNavItem
                    key={route.href}
                    icon={route.icon}
                    label={route.label}
                    href={route.href}
                />
            ))}
        </div>
    );
};

export default SidebarMenu;
