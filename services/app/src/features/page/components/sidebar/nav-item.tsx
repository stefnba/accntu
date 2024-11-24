'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useSidebar } from '@features/page/store/sidebar';
import { IconType } from 'react-icons';

interface SidebarNavItemProps {
    icon: IconType;
    label: string;
    href: string;
}

export const SidebarNavItem = ({
    icon: Icon,
    label,
    href
}: SidebarNavItemProps) => {
    const pathname = usePathname();

    const isActive =
        (pathname === '/' && href === '/') ||
        pathname === href ||
        pathname?.startsWith(`${href}/`);

    const { isOpen } = useSidebar();

    return (
        <Link
            href={href}
            className={cn(
                '[&>svg]:shrink-0',
                'font-medium md:text-sm text text-slate-500 px-4 md:py-3 py-5 flex rounded-lg md:gap-3 gap-5 items-center',
                'duration-200 ease-linear group-data-[collapsible=icon]:px-3',
                'hover:bg-primary/40 hover:text-primary',
                isActive &&
                    'bg-primary text-white hover:bg-primary hover:text-white'
            )}
        >
            <Icon className="md:size-5 size-6" />
            <div className="leading-5 opacity-100 ease-linear transition-[padding,opacity] group-data-[collapsible=icon]:opacity-0">
                {label}
            </div>
            {/* {!isOpen ? (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger>
                            {Icon && <Icon className="size-5" />}
                        </TooltipTrigger>
                        <TooltipContent side="right" sideOffset={15}>
                            <p>{label}</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            ) : (
                
            )} */}
        </Link>
    );
};

export default SidebarNavItem;
