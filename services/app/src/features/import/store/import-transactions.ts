import { create } from 'zustand';

interface State {
    count: number;
}

const initialState: State = {
    count: 0
};

interface Actions {
    updateCount: (count: number) => void;
}

export const storeImportTransactions = create<State & Actions>()(
    (set, get) => ({
        ...initialState,

        updateCount: (count) => {
            const current = get().count;

            set({ count: current + count });
        }
    })
);
