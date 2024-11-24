'use client';

import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { useSidebar } from '@features/page/store/sidebar';
import { useMedia } from 'react-use';

import { SidebarToggle, SidebarToggleButton } from '../navbar/toggle';
import Logo from './logo';
import SidebarMenu from './sidebar-menu';

export const SIDEBAR_ICON_WITH = '76px';

interface Props {
    collapsible?: 'offcanvas' | 'icon' | 'none';
}

const Sidebar: React.FC<Props> = ({ collapsible = 'icon' }) => {
    const { isOpen, handleToggle } = useSidebar();

    const isDesktop = useMedia('(min-width: 768px)', true);

    // Mobile
    if (!isDesktop) {
        return (
            <Sheet open={isOpen} onOpenChange={handleToggle}>
                <SheetContent
                    hideCloseButton
                    className="w-screen bg-slate-50 flex-col flex gap-10 justify-between"
                    side="left"
                >
                    <div className="mt-3 mb-9">
                        <Logo />
                    </div>
                    <div className="flex-grow">
                        <Separator className="mx-4 w-auto" />

                        <SidebarMenu />
                        <Separator className="mx-4 w-auto" />
                    </div>
                    {/* <SidebarToggleButton /> */}
                </SheetContent>
            </Sheet>
        );
    }

    // Desktop
    return (
        <aside
            style={
                {
                    '--sidebar-icon-width': SIDEBAR_ICON_WITH
                } as React.CSSProperties
            }
            data-state={isOpen ? 'expanded' : 'collapsed'}
            data-collapsible={!isOpen ? collapsible : ''}
            className={cn(
                'shrink-0 bg-slate-50 h-svh group peer hidden md:block'
            )}
        >
            <div
                className={cn(
                    'duration-200 relative w-[240px] transition-[width] ease-linear overflow-hidden flex-col h-screen max-h-screen flex justify-between',
                    'group-data-[collapsible=offcanvas]:w-0',
                    'group-data-[collapsible=icon]:w-[var(--sidebar-icon-width)]'
                )}
            >
                <Logo />
                <SidebarMenu />
                <SidebarToggle />
            </div>
        </aside>
    );
};

export default Sidebar;
