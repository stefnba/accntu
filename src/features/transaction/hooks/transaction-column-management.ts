import { parseAsBoolean, useQueryState } from 'nuqs';
import { useEffect, useState } from 'react';

// Available columns that can be reordered/hidden (excludes select and actions)
export const ALL_COLUMNS = [
    { id: 'date', label: 'Date', canHide: false },
    { id: 'title', label: 'Description', canHide: false },
    { id: 'account', label: 'Account', canHide: true },
    { id: 'type', label: 'Type', canHide: true },
    { id: 'spendingAmount', label: 'Amount', canHide: false },
    { id: 'label', label: 'Label', canHide: true },
    { id: 'tags', label: 'Tags', canHide: true },
    { id: 'location', label: 'Location', canHide: true },
] as const;

// Default visible columns (order matters for display)
const DEFAULT_VISIBLE_COLUMNS = ['date', 'title', 'account', 'type', 'spendingAmount', 'label'];

const STORAGE_KEY = 'transaction-visible-columns';

const getStorageValue = (): string[] => {
    if (typeof window === 'undefined') return DEFAULT_VISIBLE_COLUMNS;

    try {
        const item = localStorage.getItem(STORAGE_KEY);
        return item ? JSON.parse(item) : DEFAULT_VISIBLE_COLUMNS;
    } catch {
        return DEFAULT_VISIBLE_COLUMNS;
    }
};

const setStorageValue = (value: string[]): void => {
    if (typeof window === 'undefined') return;

    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    } catch {
        // Silently fail if localStorage is not available
    }
};

export interface ColumnManagementState {
    // Modal state
    isOpen: boolean;
    open: () => void;
    close: () => void;

    // Column state - single array for order and visibility
    columnOrder: string[];
    setColumnOrder: (order: string[]) => void;
    toggleColumnVisibility: (columnId: string) => void;
    resetAll: () => void;

    // Helper functions
    getVisibleColumns: () => string[];
    getHiddenColumns: () => string[];
    isColumnVisible: (columnId: string) => boolean;
}

export const useColumnManagement = (): ColumnManagementState => {
    const [isOpen, setIsOpen] = useQueryState(
        'column-management',
        parseAsBoolean.withDefault(false)
    );

    // Single array that represents both order and visibility
    // Only visible columns are included in the array, order determines display order
    const [columnOrder, setColumnOrderState] = useState<string[]>(() => getStorageValue());

    // Sync with localStorage whenever state changes
    useEffect(() => {
        setStorageValue(columnOrder);
    }, [columnOrder]);

    const open = () => setIsOpen(true);
    const close = () => setIsOpen(false);

    const setColumnOrder = (order: string[]) => {
        setColumnOrderState(order);
    };

    const toggleColumnVisibility = (columnId: string) => {
        const column = ALL_COLUMNS.find((col) => col.id === columnId);
        if (!column?.canHide) return; // Don't allow hiding required columns

        const isCurrentlyVisible = columnOrder.includes(columnId);

        if (isCurrentlyVisible) {
            // Remove from array (hide)
            setColumnOrderState((prev) => prev.filter((id) => id !== columnId));
        } else {
            // Add to end of array (show)
            setColumnOrderState((prev) => [...prev, columnId]);
        }
    };

    const resetAll = () => {
        setColumnOrderState(DEFAULT_VISIBLE_COLUMNS);
    };

    const getVisibleColumns = () => columnOrder;

    const getHiddenColumns = () => {
        return ALL_COLUMNS.map((col) => col.id).filter((id) => !columnOrder.includes(id));
    };

    const isColumnVisible = (columnId: string) => {
        return columnOrder.includes(columnId);
    };

    return {
        isOpen,
        open,
        close,
        columnOrder,
        setColumnOrder,
        toggleColumnVisibility,
        resetAll,
        getVisibleColumns,
        getHiddenColumns,
        isColumnVisible,
    };
};
