'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger
} from '@/components/ui/collapsible';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuLabel,
    DropdownMenuLinkItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    SidebarTrigger,
    useSidebar
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { LuChevronRight, LuCross } from 'react-icons/lu';
import { TbLayoutSidebar } from 'react-icons/tb';

import routes, { Route } from '../routes';
import Logo from './logo';

/**
 * Combine list of paths into path with correct handling of '/'.
 */
const concatenatePathnames = (pathnames: string[]) => {
    return pathnames
        .map((p, index) => {
            if (p.startsWith('/') && index !== 0) {
                p = p.slice(1);
            }
            if (p.endsWith('/')) {
                p = p.slice(0, -1);
            }
            return p;
        })
        .join('/');
};

/**
 * Check if pathname is currently active
 * @param pathname
 * @param href
 * @returns
 */
const isActivePathname = (pathname: string, href: string): boolean => {
    return (
        (pathname === '/' && href === '/') ||
        pathname === href ||
        pathname?.startsWith(`${href}/`)
    );
};

const getParentPathname = (pathname: string) => {
    if (pathname.startsWith('/')) {
        pathname = pathname.slice(1);
    }
    return '/' + pathname.split('/')[0];
};

interface AppSidebarSubMenuProps {
    currentPathname: string;
    parentRoute: Route;
    routes: Route[];
}

const AppSidebarSubMenu: React.FC<AppSidebarSubMenuProps> = ({
    parentRoute,
    currentPathname,
    routes
}) => {
    const [isOpen, setOpen] = useState(false);
    const { state, isMobile, openMobile } = useSidebar();

    // close submenu if
    useEffect(() => {
        if (
            getParentPathname(currentPathname) === parentRoute.href &&
            (state === 'expanded' || openMobile)
        ) {
            setOpen(true);
        } else {
            setOpen(false);
        }
    }, [currentPathname, parentRoute, state, openMobile]);

    // is sidebar is collapsed to icons, sumenu needs to be displayed
    // as a dropdown
    if (state === 'collapsed' && !isMobile)
        return (
            <DropdownMenu open={isOpen} onOpenChange={setOpen}>
                <SidebarMenuItem>
                    <DropdownMenuTrigger asChild className="ring-0">
                        <SidebarMenuButton
                            tooltip={isOpen ? undefined : parentRoute.label}
                            isActive={
                                getParentPathname(currentPathname) ===
                                parentRoute.href
                            }
                        >
                            <parentRoute.icon />
                            <span>{parentRoute.label}</span>
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                </SidebarMenuItem>
                <DropdownMenuContent
                    align="start"
                    side="right"
                    className="min-w-48"
                >
                    <DropdownMenuLabel className="pl-3">
                        {parentRoute.label}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup className="flex-col flex space-y-1">
                        {routes.length &&
                            routes.map((route) => (
                                <DropdownMenuLinkItem
                                    key={route.href}
                                    href={concatenatePathnames([
                                        parentRoute.href,
                                        route.href
                                    ])}
                                    className={cn(
                                        'py-2 pl-3 rounded-md',
                                        currentPathname ===
                                            concatenatePathnames([
                                                parentRoute.href,
                                                route.href
                                            ]) &&
                                            'text-primary border-l-4 rounded-l-none border-primary font-bold'
                                    )}
                                >
                                    {route.label}
                                </DropdownMenuLinkItem>
                            ))}
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>
        );

    return (
        <Collapsible
            className="group/collapsible"
            open={isOpen}
            onOpenChange={() => setOpen(!isOpen)}
        >
            <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                    <SidebarMenuButton closeMobileOnClick={false}>
                        <parentRoute.icon />
                        <span>{parentRoute.label}</span>
                        <LuChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                </CollapsibleTrigger>

                {routes.length ? (
                    <CollapsibleContent>
                        <SidebarMenuSub>
                            {routes.map((item) => (
                                <SidebarMenuSubItem key={item.label}>
                                    <SidebarMenuSubButton
                                        asChild
                                        isActive={
                                            currentPathname ===
                                            concatenatePathnames([
                                                parentRoute.href,
                                                item.href
                                            ])
                                        }
                                    >
                                        <Link
                                            href={concatenatePathnames([
                                                parentRoute.href,
                                                item.href
                                            ])}
                                        >
                                            <span>{item.label}</span>
                                        </Link>
                                    </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                            ))}
                        </SidebarMenuSub>
                    </CollapsibleContent>
                ) : null}
            </SidebarMenuItem>
        </Collapsible>
    );
};

export function AppSidebar() {
    const pathname = usePathname();

    return (
        <Sidebar variant="sidebar" collapsible="icon">
            {/* Header */}
            <SidebarHeader className="flex flex-row justify-between items-center">
                <Logo />
                <Avatar className="md:hidden size-9">
                    <AvatarFallback>U</AvatarFallback>
                </Avatar>
            </SidebarHeader>

            {/* Content */}
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {routes.map((r) => {
                                // render child routes if any
                                const childRoutes = r.routes;
                                if (childRoutes) {
                                    return (
                                        <AppSidebarSubMenu
                                            key={r.href}
                                            currentPathname={pathname}
                                            parentRoute={r}
                                            routes={childRoutes}
                                        />
                                    );
                                }

                                return (
                                    <SidebarMenuItem key={r.href}>
                                        <SidebarMenuButton
                                            tooltip={r.label}
                                            isActive={isActivePathname(
                                                pathname,
                                                r.href
                                            )}
                                            asChild
                                        >
                                            <Link href={r.href}>
                                                <r.icon />
                                                <span>{r.label}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                );
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            {/* Footer */}
            <SidebarFooter>
                <div className="group-hover:block hidden">
                    <SidebarTrigger>
                        <TbLayoutSidebar className="size-5 text-sidebar-primary" />
                    </SidebarTrigger>
                </div>
                {/* Mobile Sidebar Close Button */}
                <div className="md:hidden">
                    <SidebarTrigger className="size-12 text-white bg-primary hover:bg-primary/80 ">
                        <LuCross className="size-10 text-white rotate-45" />
                    </SidebarTrigger>
                </div>
            </SidebarFooter>
        </Sidebar>
    );
}
