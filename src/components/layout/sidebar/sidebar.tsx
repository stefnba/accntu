'use client';

import * as React from 'react';

import { NavDocuments, NavMain, NavUser } from '@/components/layout/nav';

import { Sidebar, SidebarContent, SidebarFooter } from '@/components/ui/sidebar';
import { secondaryRoutes } from '@/lib/routes';
import { SidebarLogo } from './logo';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    return (
        <Sidebar {...props}>
            <SidebarLogo />
            <SidebarContent>
                <NavMain />
                <NavDocuments items={secondaryRoutes} />
                {/* <NavSecondary items={data.navSecondary} className="mt-auto" /> */}
            </SidebarContent>
            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
