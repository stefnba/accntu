import { useTransactionTableRowSelection } from '@/features/transaction/hooks/transaction-row-selection';

export const TransactionSelectionBar = () => {
    const { selectedRowIds, setRowSelection } = useTransactionTableRowSelection();

    if (selectedRowIds.length === 0) return null;

    return (
        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <span className="text-sm font-medium">
                {selectedRowIds.length} transactions selected
            </span>
            <div className="flex gap-2">
                <button
                    // onClick={() => setIsBulkUpdateOpen(true)}
                    className="px-3 py-1 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90"
                >
                    Bulk Update
                </button>
                <button
                    onClick={() => setRowSelection({})}
                    className="px-3 py-1 bg-secondary text-secondary-foreground rounded-md text-sm hover:bg-secondary/80"
                >
                    Clear Selection
                </button>
            </div>
        </div>
    );
};
