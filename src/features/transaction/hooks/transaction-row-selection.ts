import { RowSelectionState, Updater } from '@tanstack/react-table';
import { useMemo } from 'react';
import { create } from 'zustand';

type RowSelectionStore = {
    selectedRows: RowSelectionState;
    handleRowSelection: (updater: Updater<RowSelectionState>) => void;
};

const useRowSelectionStore = create<RowSelectionStore>((set) => ({
    selectedRows: {},
    handleRowSelection: (updater) => {
        set((state) => ({
            selectedRows: typeof updater === 'function' ? updater(state.selectedRows) : updater,
        }));
    },
}));

/**
 * Hook to manage transaction table row selection.
 */
export const useTransactionTableRowSelection = () => {
    const rowSelection = useRowSelectionStore((state) => state.selectedRows);
    const setRowSelection = useRowSelectionStore((state) => state.handleRowSelection);

    const selectedRowIds = useMemo(() => Object.keys(rowSelection), [rowSelection]);

    const selectRowsFromIds = (ids: string[]) => {
        setRowSelection((prev) => {
            return ids.reduce((acc, id) => {
                acc[id] = true;
                return acc;
            }, prev);
        });
    };

    return {
        rowSelection,
        setRowSelection,
        selectedRowIds,
        selectRowsFromIds,
    };
};
