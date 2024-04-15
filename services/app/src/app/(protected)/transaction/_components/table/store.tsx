import { create } from 'zustand';

interface ITransactionTableFilteringStore {
    filters: number;
    resetFilters: () => void;
    setFilter: (page: number) => void;
}

interface ITransactionTablePaginationStore {
    page: number;
    pageSize: number;
    setPageSize: (pageSize: number) => void;
    setPage: (page: number) => void;
}

interface ITransactionTableColumnVisibilityStore {
    columns: string[];
    setColumns: (columns: string[]) => void;
}

export const useTransactionTableFilteringStore =
    create<ITransactionTableFilteringStore>((set) => ({
        filters: 0,
        resetFilters: () => set({ filters: 0 }),
        setFilter: (filters) => set({ filters })
    }));

export const useTransactionTablePaginationStore =
    create<ITransactionTablePaginationStore>((set) => ({
        page: 1,
        pageSize: 25,
        setPageSize: (pageSize) => set({ pageSize }),
        setPage: (page) => set({ page })
    }));

export const useTransactionTableColumnVisibilityStore =
    create<ITransactionTableColumnVisibilityStore>((set) => ({
        columns: [],
        setColumns: (columns) => set({ columns })
    }));
