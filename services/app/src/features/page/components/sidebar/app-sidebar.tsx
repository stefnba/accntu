'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarInset,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarTrigger,
    useSidebar
} from '@/components/ui/sidebar';

import { SidebarToggleButton } from '../navbar/toggle';
import routes from '../routes';
import Logo from './logo';

export function AppSidebar() {
    const { toggleSidebar } = useSidebar();

    const pathname = usePathname();

    return (
        <Sidebar variant="sidebar" collapsible="icon">
            <SidebarHeader>
                <Logo />
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {routes.map((r) => (
                                <SidebarMenuItem key={r.href}>
                                    <SidebarMenuButton
                                        isActive={
                                            (pathname === '/' &&
                                                r.href === '/') ||
                                            pathname === r.href ||
                                            pathname?.startsWith(`${r.href}/`)
                                        }
                                        asChild
                                    >
                                        <Link href={r.href}>
                                            <r.icon />
                                            <span>{r.label}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <SidebarTrigger />
                {/* <SidebarToggleButton handleToggle={toggleSidebar} /> */}
                {/* <TbLayoutSidebar className="md:size-5 size-8 md:text-slate-500 text-white cursor-pointer" /> */}
            </SidebarFooter>
        </Sidebar>
    );
}
