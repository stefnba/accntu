'use client';

import { useTransactionEndpoints } from '@/features/transaction/api';
import { TransactionDetailsTabContent } from '@/features/transaction/components/transaction-details/tab-content';
import { TransactionError } from '@/features/transaction/components/transaction-details/transaction-error';
import { TransactionHeader } from '@/features/transaction/components/transaction-details/transaction-header';
import { TransactionLoading } from '@/features/transaction/components/transaction-details/transaction-loading';
import { TransactionNavigation } from '@/features/transaction/components/transaction-details/transaction-navigation';
import { TransactionQuickInfo } from '@/features/transaction/components/transaction-details/transaction-quick-info';
import { TransactionTabs } from '@/features/transaction/components/transaction-details/transaction-tabs';

interface TransactionDetailsViewProps {
    transactionId: string;
}

export const TransactionDetailsView = ({ transactionId }: TransactionDetailsViewProps) => {
    const {
        data: transaction,
        isLoading,
        error,
    } = useTransactionEndpoints.getById({
        param: { id: transactionId },
    });

    if (isLoading) {
        return <TransactionLoading />;
    }

    if (error || !transaction) {
        return <TransactionError />;
    }

    return (
        <div className="space-y-6">
            <TransactionNavigation />
            <TransactionHeader transactionId={transactionId} />
            <TransactionQuickInfo transactionId={transactionId} />
            <TransactionTabs transactionId={transactionId} />
            <TransactionDetailsTabContent transactionId={transactionId} />
        </div>
    );
};
