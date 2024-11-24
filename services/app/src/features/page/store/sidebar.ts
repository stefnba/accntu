import { create } from 'zustand';

type State = {
    isOpen: boolean;
};

type Action = {
    handleToggle: () => void;
};

export const useSidebar = create<State & Action>((set) => ({
    isOpen: true,
    handleToggle: () => set((state) => ({ isOpen: !state.isOpen }))
}));
