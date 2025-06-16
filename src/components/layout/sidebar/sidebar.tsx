'use client';

import {
    IconCamera,
    IconDatabase,
    IconFileAi,
    IconFileDescription,
    IconFileWord,
    IconReport,
} from '@tabler/icons-react';
import * as React from 'react';

import * as Icons from '@/components/icons';

import { NavDocuments, NavMain, NavSecondary, NavUser } from '@/components/layout/nav';

import { Sidebar, SidebarContent, SidebarFooter } from '@/components/ui/sidebar';
import { SidebarLogo } from './logo';

const data = {
    navClouds: [
        {
            title: 'Capture',
            icon: IconCamera,
            isActive: true,
            url: '#',
            items: [
                {
                    title: 'Active Proposals',
                    url: '#',
                },
                {
                    title: 'Archived',
                    url: '#',
                },
            ],
        },
        {
            title: 'Proposal',
            icon: IconFileDescription,
            url: '#',
            items: [
                {
                    title: 'Active Proposals',
                    url: '#',
                },
                {
                    title: 'Archived',
                    url: '#',
                },
            ],
        },
        {
            title: 'Prompts',
            icon: IconFileAi,
            url: '#',
            items: [
                {
                    title: 'Active Proposals',
                    url: '#',
                },
                {
                    title: 'Archived',
                    url: '#',
                },
            ],
        },
    ],
    navSecondary: [
        {
            title: 'Settings',
            url: '#',
            icon: Icons.Settings,
        },
        {
            title: 'Search',
            url: '#',
            icon: Icons.Search,
        },
    ],
    budgeting: [
        {
            name: 'Income & Expenses',
            url: '/budget',
            icon: IconDatabase,
        },
        {
            name: 'Labels',
            url: '/labels',
            icon: IconReport,
        },
        {
            name: 'Tags',
            url: '/tags',
            icon: IconFileWord,
        },
        {
            name: 'Buckets',
            url: '/buckets',
            icon: IconFileWord,
        },
    ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    return (
        <Sidebar {...props}>
            <SidebarLogo />
            <SidebarContent>
                <NavMain />
                <NavDocuments items={data.budgeting} />
                <NavSecondary items={data.navSecondary} className="mt-auto" />
            </SidebarContent>
            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
