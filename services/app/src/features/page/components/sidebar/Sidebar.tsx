'use client';

import { useSidebar } from '@/hooks/sidebar';
import { cn } from '@/lib/utils';

import SidebarMenu from './Menu';

const Sidebar = () => {
    const { isOpen } = useSidebar();
    return (
        <aside
            className={cn(
                'sticky bottom-0 top-[104px] z-50 hidden h-full items-center transition md:block'
                // isOpen && 'md:hidden'
            )}
        >
            <SidebarMenu />
        </aside>
    );
};

export default Sidebar;
