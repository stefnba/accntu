import {
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarTrigger,
    useSidebar,
} from '@/components/ui/sidebar';
import Image from 'next/image';
import Link from 'next/link';

export const SidebarLogo = () => {
    const { toggleSidebar, state } = useSidebar();

    return (
        <SidebarHeader>
            <SidebarMenu>
                <SidebarMenuItem>
                    <div className="flex items-center justify-between w-full group">
                        <SidebarMenuButton
                            asChild
                            className="data-[slot=sidebar-menu-button]:!p-1.5 flex-1 group-data-[collapsible=icon]:group-hover:opacity-0 transition-opacity"
                        >
                            <Link href="/">
                                <Image
                                    className="!size-5 flex-shrink-0"
                                    src="/images/logo.png"
                                    alt="Accntu"
                                    width={20}
                                    height={20}
                                />
                                <span className="text-base font-semibold ml-1 group-data-[collapsible=icon]:hidden">
                                    accntu
                                </span>
                            </Link>
                        </SidebarMenuButton>

                        <SidebarTrigger className="opacity-0 group-hover:opacity-100 transition-opacity group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:group-hover:opacity-100 group-data-[collapsible=icon]:absolute group-data-[collapsible=icon]:left-1/2 group-data-[collapsible=icon]:-translate-x-1/2" />
                    </div>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarHeader>
    );
};
