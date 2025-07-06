'use client';

import { TransactionSelectionBar } from '@/features/transaction/components/transaction-selection-bar';
import { TransactionTableFilters } from '@/features/transaction/components/transaction-table-filters';
import { TransactionDataTable } from '@/features/transaction/components/transaction-table/transaction-data-table';

export const TransactionTable = () => {
    // if (error) {
    //     return (
    //         <div className="flex items-center justify-center p-8">
    //             <div className="text-center">
    //                 <p className="text-destructive">Failed to load transactions</p>
    //                 <p className="text-sm text-muted-foreground mt-1">{error.error.message}</p>
    //             </div>
    //         </div>
    //     );
    // }

    return (
        <div className="space-y-4">
            <TransactionTableFilters />

            {/* Bulk actions bar */}
            <TransactionSelectionBar />

            <TransactionDataTable />

            {/* <TransactionBulkUpdateDrawer
                isOpen={isBulkUpdateOpen}
                onClose={() => {
                    setIsBulkUpdateOpen(false);
                    setRowSelection({}); // Clear selection after bulk update
                }}
                selectedTransactions={selectedTransactions}
                filterOptions={filterOptions}
            /> */}
        </div>
    );
};
