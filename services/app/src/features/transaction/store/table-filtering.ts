import type {
    TTransactionFilter,
    TTransactionFilterKeys
} from '@/features/transaction/components/table-filter/filters/types';
import { create } from 'zustand';

type FilterValue = string | Array<string | null> | null | {};

interface IStoreTransactionTableFiltering {
    filters: TTransactionFilter;
    resetFilters: () => void;
    setFilter: (key: TTransactionFilterKeys, value: FilterValue) => void;
    resetFilterKey: (key: TTransactionFilterKeys) => void;
}

export const DEFAULT_FILTERS: TTransactionFilter = {};

export const storeTransactionTableFiltering =
    create<IStoreTransactionTableFiltering>((set) => ({
        filters: DEFAULT_FILTERS,
        resetFilters: () => set({ filters: DEFAULT_FILTERS }),
        resetFilterKey: (key) =>
            set((state) => {
                const { [key]: _, ...rest } = state.filters;
                return { filters: rest };
            }),
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
