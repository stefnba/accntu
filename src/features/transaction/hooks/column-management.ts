'use client';

import { transactionColumns } from '@/features/transaction/components/transaction-table/table-columns';
import { useLocalStorage } from '@/hooks/local-store';
import { ColumnOrderState, Updater, VisibilityState } from '@tanstack/react-table';
import { parseAsBoolean, useQueryState } from 'nuqs';

// Generate default state from the single source of truth
const defaultColumnState: VisibilityState = {};
const defaultColumnOrder: string[] = [];

for (const col of transactionColumns) {
    const colId = col.id || (col as { accessorKey: string }).accessorKey;
    if (colId) {
        // A column is visible by default if it cannot be hidden, or if it is
        // explicitly set to be visible by default.
        defaultColumnState[colId] = col.enableHiding === false || col.isDefaultVisible === true;
        defaultColumnOrder.push(colId);
    }
}

/**
 * Hook to manage modal state for column management.
 */
export const useColumnManagementModal = () => {
    const [isOpen, setIsOpen] = useQueryState(
        'column-management',
        parseAsBoolean.withDefault(false)
    );
    return {
        isOpen: isOpen ?? false,
        open: () => setIsOpen(true),
        close: () => setIsOpen(null),
    };
};

const COLUMN_STATE_STORAGE_KEY = 'transaction-column-state';

/**
 * Hook to manage column visibility and order for the transaction table.
 * Persists state to localStorage using a single state object.
 */
export const useTransactionColumnState = () => {
    const [columnState, setColumnState] = useLocalStorage<VisibilityState>(
        COLUMN_STATE_STORAGE_KEY,
        defaultColumnState
    );

    /**
     * Updates the column visibility.
     * @param updater - The updater function or the new visibility state.
     */
    const onColumnVisibilityChange = (updater: Updater<VisibilityState>) => {
        setColumnState((oldState) => {
            const newState = typeof updater === 'function' ? updater(oldState) : updater;
            return { ...oldState, ...newState };
        });
    };

    /**
     * Updates the column order.
     * @param updater - The updater function or the new order.
     */
    const onColumnOrderChange = (updater: Updater<ColumnOrderState>) => {
        setColumnState((currentColumnState) => {
            const oldOrder = Object.keys(currentColumnState);
            const newOrder = typeof updater === 'function' ? updater(oldOrder) : updater;

            const newState: VisibilityState = {};
            // Add all columns from newOrder, preserving their visibility
            for (const colId of newOrder) {
                newState[colId] = currentColumnState[colId] ?? defaultColumnState[colId] ?? false;
            }
            // Add any other columns from old state that are not in newOrder
            for (const colId in currentColumnState) {
                if (!Object.prototype.hasOwnProperty.call(newState, colId)) {
                    newState[colId] = currentColumnState[colId];
                }
            }
            return newState;
        });
    };

    const reset = () => {
        setColumnState(defaultColumnState);
    };

    const columnOrder =
        Object.keys(columnState).length > 0 ? Object.keys(columnState) : defaultColumnOrder;

    return {
        columnVisibility: columnState,
        onColumnVisibilityChange,
        columnOrder,
        onColumnOrderChange,
        reset,
    };
};
