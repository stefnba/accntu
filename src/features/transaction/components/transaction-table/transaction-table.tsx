'use client';

import { TransactionTableFilters } from '../transaction-table-filters';
import { TransactionDataTable } from './transaction-data-table';

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

            {/* Bulk actions bar
            {selectedTransactions.length > 0 && (
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="text-sm font-medium">
                        {selectedTransactions.length} transactions selected
                    </span>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setIsBulkUpdateOpen(true)}
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
            )} */}

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
