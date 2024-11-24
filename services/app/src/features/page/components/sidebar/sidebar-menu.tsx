'use client';

import { cn } from '@/lib/utils';

import routes from '../routes';
import SidebarNavItem from './nav-item';

const SidebarMenu = () => {
    return (
        <div className={cn('space-y-[12px] mx-4 box-content my-8 flex-grow')}>
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
