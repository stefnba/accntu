import { create } from 'zustand';

type SidebarStore = {
    isOpen: boolean;
    onOpen: () => void;
    onClose: () => void;
};

export const useSidebar = create<SidebarStore>((set) => ({
    isOpen: true,
    onOpen: () => set({ isOpen: true }),
    onClose: () => set({ isOpen: false })
}));
