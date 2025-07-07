'use client';

import { TransactionSelectionBar } from '@/features/transaction/components/transaction-selection-bar';
import { TransactionTableFilters } from '@/features/transaction/components/transaction-table-filters';
import { TransactionDataTable } from '@/features/transaction/components/transaction-table/data-table';

export const TransactionTableManager = () => {
    return (
        <div className="space-y-4">
            <TransactionTableFilters />

            {/* Bulk actions bar */}
            <TransactionSelectionBar />

            <TransactionDataTable />
        </div>
    );
};
