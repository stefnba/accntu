import {
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import Image from 'next/image';
import Link from 'next/link';

export const SidebarLogo = () => {
    return (
        <SidebarHeader>
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
                        <Link href="/">
                            <Image
                                className="!size-5"
                                src="/images/logo.png"
                                alt="Accntu"
                                width={20}
                                height={20}
                            />
                            <span className="text-base font-semibold ml-1">accntu</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarHeader>
    );
};
