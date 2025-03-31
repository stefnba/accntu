'use client';

import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import Link from 'next/link';

import { appRoutes } from '@/lib/routes';
import { usePathname } from 'next/navigation';

/**
 * Check if pathname is currently active
 * @param pathname
 * @param href
 * @returns
 */
const isActivePathname = (pathname: string, href: string): boolean => {
    return (
        (pathname === '/' && href === '/') || pathname === href || pathname?.startsWith(`${href}/`)
    );
};

export function NavMain() {
    const pathname = usePathname();

    return (
        <SidebarGroup>
            <SidebarGroupContent className="flex flex-col gap-2">
                <SidebarMenu></SidebarMenu>
                <SidebarMenu>
                    {appRoutes.map(({ path, label, icon: Icon }) => (
                        <SidebarMenuItem key={String(path)}>
                            <Link href={path}>
                                <SidebarMenuButton
                                    isActive={isActivePathname(pathname, String(path))}
                                    tooltip={label}
                                >
                                    {Icon && <Icon />}
                                    <span>{label}</span>
                                </SidebarMenuButton>
                            </Link>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
}
