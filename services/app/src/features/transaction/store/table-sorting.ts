import {
    TTransactionOrderByObject,
    TransactionOrderByObjectSchema,
    orderByColumns
} from '@/features/transaction/schema/table-sorting';
import { z } from 'zod';
import { create } from 'zustand';

export const DEFAULT_SORTING: Array<TTransactionOrderByObject> = [
    { direction: 'desc', column: 'date' },
    { direction: 'asc', column: 'title' }
];

interface IStoreTransactionTableSorting {
    sorting: Array<TTransactionOrderByObject>;
    setSorting: (
        column: TTransactionOrderByObject['column'],
        direction: TTransactionOrderByObject['direction'],
        append?: boolean
    ) => void;
}

export const storeTransactionTableSorting =
    create<IStoreTransactionTableSorting>((set) => ({
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
