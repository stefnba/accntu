import { create } from 'zustand';

import type {
    TTransactionFilter,
    TTransactionFilterKeys
} from './filters/types';

interface ITransactionTableColumnVisibilityStore {
    columns: string[];
    setColumns: (columns: string[]) => void;
}

export const useTransactionTableColumnVisibilityStore =
    create<ITransactionTableColumnVisibilityStore>((set) => ({
        columns: [],
        setColumns: (columns) => set({ columns })
    }));

type FilterValue = string | string[] | null;

interface ITransactionTableFilteringStore {
    filters: TTransactionFilter;
    resetFilters: () => void;
    setFilter: (key: TTransactionFilterKeys, value: FilterValue) => void;
}

export const DEFAULT_FILTERS: TTransactionFilter = {};

export const useTransactionTableFilteringStore =
    create<ITransactionTableFilteringStore>((set) => ({
        filters: DEFAULT_FILTERS,
        resetFilters: () => set({ filters: DEFAULT_FILTERS }),
        setFilter: (key, value) =>
            set((state) => {
                if (
                    (Array.isArray(value) && value.length === 0) ||
                    value === undefined
                ) {
                    const { [key]: _, ...rest } = state.filters;
                    return { filters: rest };
                }

                return {
                    filters: { ...state.filters, [key]: value }
                };
            })
    }));

interface ITransactionTablePaginationStore {
    page: number;
    pageSize: number;
    setPageSize: (pageSize: number) => void;
    setPage: (page: number) => void;
}

export const DEFAULT_PAGE_SIZE = 10;
export const DEFAULT_PAGE = 1;

export const useTransactionTablePaginationStore =
    create<ITransactionTablePaginationStore>((set) => ({
        page: DEFAULT_PAGE,
        pageSize: DEFAULT_PAGE_SIZE,
        setPageSize: (pageSize) => set({ pageSize, page: 1 }),
        setPage: (page) => set({ page })
    }));
