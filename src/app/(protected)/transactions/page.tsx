import { MainContent } from '@/components/layout/main';
import { TransactionTable } from '@/features/transaction/components/transaction-table';

export default function TransactionsPage() {
    return (
        <MainContent
            pageHeader={{
                title: 'Transactions',
                description: 'View and manage your financial transactions',
            }}
        >
            <TransactionTable />
        </MainContent>
    );
}
