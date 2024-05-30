import { OnChangeFn, RowSelectionState } from '@tanstack/react-table';
import { create } from 'zustand';

interface IStoreTransactionTableRowSelection {
    rowSelection: RowSelectionState;
    // setRowSelection: OnChangeFn<RowSelectionState>;
    setRowSelection: (
        updaterOrValue:
            | RowSelectionState
            | ((old: RowSelectionState) => RowSelectionState)
    ) => void;
}

export const storeTransactionTableRowSelection =
    create<IStoreTransactionTableRowSelection>((set) => ({
        rowSelection: {},
        setRowSelection: (rowSelection) =>
            set((state) => {
                if (typeof rowSelection === 'function') {
                    return { rowSelection: rowSelection(state.rowSelection) };
                }

                return { rowSelection };
            })
    }));
