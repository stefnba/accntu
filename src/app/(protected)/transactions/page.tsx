import { MainContent } from '@/components/layout/main';
import {
    TransactionActionBar,
    TransactionPeekSheet,
    TransactionTable,
} from '@/features/transaction/components';
import { ColumnManagementModal } from '@/features/transaction/components/transaction-table/column-management-modal';

export default function TransactionsPage() {
    return (
        <MainContent
            limitWidth={false}
            pageHeader={{
                title: 'Transactions',
                description: 'View and manage your financial transactions',
                actionBar: <TransactionActionBar />,
            }}
        >
            <TransactionTable />
            <TransactionPeekSheet />
            <ColumnManagementModal />
        </MainContent>
    );
}
