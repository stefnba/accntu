import { TTransactionOrderByObject } from '@/actions/transaction/schema';
import { OnChangeFn, RowSelectionState } from '@tanstack/react-table';
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

interface ITransactionTableRowSelectionStore {
    rowSelection: RowSelectionState;
    // setRowSelection: OnChangeFn<RowSelectionState>;
    setRowSelection: (
        updaterOrValue:
            | RowSelectionState
            | ((old: RowSelectionState) => RowSelectionState)
    ) => void;
}

export const useTransactionTableRowSelectionStore =
    create<ITransactionTableRowSelectionStore>((set) => ({
        rowSelection: {},
        setRowSelection: (rowSelection) =>
            set((state) => {
                if (typeof rowSelection === 'function') {
                    return { rowSelection: rowSelection(state.rowSelection) };
                }

                return { rowSelection };
            })
    }));

type FilterValue = string | Array<string | null> | null | {};
// type FilterValue = string | Array<string | null> | null;

interface ITransactionTableFilteringStore {
    filters: TTransactionFilter;
    resetFilters: () => void;
    setFilter: (key: TTransactionFilterKeys, value: FilterValue) => void;
    resetFilterKey: (key: TTransactionFilterKeys) => void;
}

export const DEFAULT_FILTERS: TTransactionFilter = {};

export const useTransactionTableFilteringStore =
    create<ITransactionTableFilteringStore>((set) => ({
        filters: DEFAULT_FILTERS,
        resetFilters: () => set({ filters: DEFAULT_FILTERS }),
        resetFilterKey: (key) =>
            set((state) => {
                const { [key]: _, ...rest } = state.filters;
                return { filters: rest };
            }),
        setFilter: (key, value) =>
            set((state) => {
                console.log(key, value);
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

interface ITransactionTableSortingStore {
    sorting: Array<TTransactionOrderByObject>;
    setSorting: (
        column: TTransactionOrderByObject['column'],
        direction: TTransactionOrderByObject['direction'],
        append?: boolean
    ) => void;
}

export const DEFAULT_SORTING: Array<TTransactionOrderByObject> = [
    { direction: 'desc', column: 'date' },
    { direction: 'asc', column: 'title' }
];

export const useTransactionTableSortingStore =
    create<ITransactionTableSortingStore>((set) => ({
        sorting: DEFAULT_SORTING,
        setSorting: (column, direction, append) =>
            set((state) => {
                // if append is false, just set the sorting to the specified column
                if (!append) {
                    return {
                        sorting: [{ column, direction }]
                    };
                }

                // if append is true, add the sorting to the existing sorting
                // but remove the existing sorting for the same column
                const existingSorting = state.sorting.filter(
                    (s) => s.column !== column
                );

                return {
                    sorting: [...existingSorting, { column, direction }]
                };
            })
    }));
