'use client';

import { usePathname } from 'next/navigation';
import { IconType } from 'react-icons';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useSidebar } from '@/hooks/sidebar';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger
} from '@/components/ui/tooltip';

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
                'flex rounded-md px-2 py-1 hover:bg-primary/40  hover:text-primary',
                isActive && 'bg-primary/20 text-primary hover:bg-primary/30'
                // 'bg-red-200/20 text-red-500 hover:bg-red-200/20 hover:text-red-700'
            )}
        >
            <div
                className={cn('flex items-center py-2', !isOpen && 'flex-col')}
            >
                {!isOpen ? (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger>
                                {Icon && <Icon className="h-6 w-6" />}
                            </TooltipTrigger>
                            <TooltipContent side="right" sideOffset={15}>
                                <p>{label}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                ) : (
                    <Icon className="h-6 w-6" />
                )}
                <div
                    className={cn(
                        'font-500 ml-6 w-32 text-sm',
                        !isOpen && 'mx-0 mt-2 w-auto text-[10px]',
                        !isOpen && true && 'hidden'
                    )}
                >
                    {label}
                </div>
            </div>
        </Link>
    );
};

export default SidebarNavItem;
