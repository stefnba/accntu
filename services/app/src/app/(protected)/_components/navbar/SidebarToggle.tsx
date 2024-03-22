'use client';

import { useSidebar } from '@/hooks/sidebar';
import { Menu } from 'lucide-react';

export const SidebarToggle = () => {
    const { onOpen, onClose, isOpen } = useSidebar();

    return (
        <button onClick={() => (isOpen ? onClose() : onOpen())}>
            <Menu className="mr-6 h-8 w-8 cursor-pointer rounded-md p-1 hover:bg-gray-100 hover:shadow-sm" />
        </button>
    );
};
