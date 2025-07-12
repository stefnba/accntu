'use client';

import { IconDotsVertical, IconLogout } from '@tabler/icons-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from '@/components/ui/sidebar';

import Link from 'next/link';

import { Admin } from '@/components/icons';
import { useAuth } from '@/lib/auth/client/session';
import { userRoutes } from '@/lib/routes';

export function NavUser() {
    const { isMobile } = useSidebar();
    const { user, signOut } = useAuth();

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground cursor-pointer"
                        >
                            <Avatar className="h-8 w-8 rounded-lg">
                                <AvatarImage
                                    src={user?.image ?? undefined}
                                    alt={user?.name ?? ''}
                                />
                                <AvatarFallback className="rounded-lg">
                                    {user?.name?.charAt(0).toUpperCase()}
                                    {user?.lastName?.charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-medium">
                                    {user?.name} {user?.lastName}
                                </span>
                                <span className="text-muted-foreground truncate text-xs">
                                    {user?.email}
                                </span>
                            </div>
                            <IconDotsVertical className="ml-auto size-4" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                        side={isMobile ? 'bottom' : 'right'}
                        align="end"
                        sideOffset={4}
                    >
                        <DropdownMenuLabel className="p-0 font-normal">
                            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                <Avatar className="h-8 w-8 rounded-lg">
                                    <AvatarImage
                                        src={user?.image ?? undefined}
                                        alt={user?.name ?? ''}
                                    />
                                    <AvatarFallback className="rounded-lg">
                                        {user?.name?.charAt(0).toUpperCase()}
                                        {user?.lastName?.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-medium">
                                        {user?.name} {user?.lastName}
                                    </span>
                                    <span className="text-muted-foreground truncate text-xs">
                                        {user?.email}
                                    </span>
                                </div>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            {userRoutes.map(({ path, label, icon: Icon }) => (
                                <DropdownMenuItem asChild key={String(path)}>
                                    <Link href={path}>
                                        {Icon && <Icon />}
                                        {label}
                                    </Link>
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuGroup>
                        {user?.role === 'admin' && (
                            <DropdownMenuGroup>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link href="/admin">
                                        <Admin className="size-4" />
                                        Admin
                                    </Link>
                                </DropdownMenuItem>
                            </DropdownMenuGroup>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => signOut()}>
                            <IconLogout />
                            Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
