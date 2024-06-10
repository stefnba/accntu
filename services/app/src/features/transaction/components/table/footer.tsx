import { useGetTransactions } from '@/features/transaction/api/get-transactions';
import { storeTransactionTableRowSelection } from '@/features/transaction/store';

import { TransactionTablePagination } from './pagination';

export const TransactionTableFooter = () => {
    return (
        <div className="flex items-center justify-between px-1 mb-8">
            <TransactionTablePaginationCount />
            <TransactionTablePagination />
        </div>
    );
};

function TransactionTablePaginationCount() {
    const { rowSelection, setRowSelection } =
        storeTransactionTableRowSelection();

    const { count: totalCount } = useGetTransactions();

    const count = {
        selected: Object.keys(rowSelection).length,
        total: totalCount
    };

    return (
        <div className="flex-1 text-sm text-muted-foreground">
            {count.selected === 0
                ? `Total: ${count.total} records`
                : `${count.selected} of ${count.total} records selected`}

            {count.selected > 0 && (
                <button
                    className="text-sm text-muted-foreground hover:underline ml-4"
                    onClick={() => setRowSelection({})}
                >
                    De-select all
                </button>
            )}
        </div>
    );
}
