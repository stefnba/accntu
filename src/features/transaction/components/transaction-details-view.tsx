'use client';

import { useTransactionEndpoints } from '../api';
import {
    TransactionNavigation,
    TransactionHeader,
    TransactionQuickInfo,
    TransactionTabs,
    TransactionLoading,
    TransactionError,
} from './transaction-details';

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
            <TransactionHeader transaction={transaction} />
            <TransactionQuickInfo transaction={transaction} />
            <TransactionTabs transaction={transaction} />
        </div>
    );
};