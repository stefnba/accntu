'use client';

import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarSeparator,
} from '@/components/ui/sidebar';
import {
    Settings,
    Database,
    Users,
    BarChart3,
    Shield,
    ArrowLeft,
    Building2,
    CreditCard,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const adminNavItems = [
    {
        title: 'Dashboard',
        url: '/admin',
        icon: BarChart3,
    },
    {
        title: 'Global Banks',
        url: '/admin/banks',
        icon: Building2,
    },
    {
        title: 'Bank Accounts',
        url: '/admin/accounts',
        icon: CreditCard,
    },
    {
        title: 'User Management',
        url: '/admin/users',
        icon: Users,
    },
    {
        title: 'System Settings',
        url: '/admin/settings',
        icon: Settings,
    },
    {
        title: 'Database',
        url: '/admin/database',
        icon: Database,
    },
    {
        title: 'Security',
        url: '/admin/security',
        icon: Shield,
    },
];

export const AdminSidebar = () => {
    const pathname = usePathname();

    return (
        <Sidebar variant="sidebar" collapsible="icon" className="border-r-2 border-red-200 bg-red-50/50">
            <SidebarHeader className="border-b border-red-200 bg-red-100/50">
                <div className="flex items-center gap-2 px-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-red-600 text-white">
                        <Shield className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-semibold text-red-900">Admin Panel</span>
                        <span className="text-xs text-red-700">System Management</span>
                    </div>
                </div>
            </SidebarHeader>

            <SidebarContent className="bg-red-50/30">
                <SidebarGroup>
                    <SidebarGroupLabel className="text-red-700">Administration</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {adminNavItems.map((item) => {
                                const isActive = pathname === item.url;
                                return (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton
                                            asChild
                                            className={cn(
                                                'transition-colors',
                                                isActive
                                                    ? 'bg-red-200 text-red-900 hover:bg-red-300'
                                                    : 'text-red-700 hover:bg-red-100 hover:text-red-900'
                                            )}
                                        >
                                            <Link href={item.url}>
                                                <item.icon className="h-4 w-4" />
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                );
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarSeparator className="bg-red-200" />

                <SidebarGroup>
                    <SidebarGroupLabel className="text-red-700">Quick Actions</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <div className="px-2 py-2">
                            <Button
                                variant="outline"
                                size="sm"
                                asChild
                                className="w-full justify-start border-red-300 text-red-700 hover:bg-red-100"
                            >
                                <Link href="/dashboard">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Back to App
                                </Link>
                            </Button>
                        </div>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    );
};