import { MainContent } from '@/components/layout/main';
import { TransactionPeekSheet, TransactionTable } from '@/features/transaction/components';

export default function TransactionsPage() {
    return (
        <MainContent
            pageHeader={{
                title: 'Transactions',
                description: 'View and manage your financial transactions',
            }}
        >
            <TransactionTable />
            <TransactionPeekSheet />
        </MainContent>
    );
}
