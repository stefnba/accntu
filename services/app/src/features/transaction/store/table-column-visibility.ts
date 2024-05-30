import { create } from 'zustand';

interface IStoreTransactionTableColumnVisibility {
    columns: string[];
    setColumns: (columns: string[]) => void;
}

export const storeTransactionTableColumnVisibility =
    create<IStoreTransactionTableColumnVisibility>((set) => ({
        columns: [],
        setColumns: (columns) => set({ columns })
    }));
