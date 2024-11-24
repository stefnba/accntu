'use client';

import { cn } from '@/lib/utils';
import { useSidebar } from '@features/page/store/sidebar';
import { handle } from 'hono/vercel';
import { TbLayoutSidebar } from 'react-icons/tb';

export const SidebarToggle = () => {
    return (
        <div
            className={cn(
                'mb-2 ml-[100px] mr-4',
                'duration-200 transition-[margin] transform group-data-[collapsible=icon]:ml-[18px] linear'
            )}
        >
            {/* <SidebarToggleButton /> */}
        </div>
    );
};

/**
 * Fixed sidebar toggle button for mobile.
 */
export const SidebarTogglMobile = () => {
    return (
        <div className="md:hidden absolute text-3xl bottom-6 left-6 z-10">
            {/* <SidebarToggleButton /> */}
        </div>
    );
};

export const SidebarToggleButton: React.FC<{ handleToggle: () => void }> = ({
    handleToggle
}) => {
    // const { handleToggle } = useSidebar();

    return (
        <button
            onClick={handleToggle}
            className="z-10 md:p-1 p-2 flex md:size-10 md:hover:bg-slate-200 bg-primary md:bg-transparent justify-center items-center rounded-lg hover:bg-primary/80 shadow-md md:shadow-none"
        >
            <TbLayoutSidebar className="md:size-5 size-8 md:text-slate-500 text-white cursor-pointer" />
        </button>
    );
};
