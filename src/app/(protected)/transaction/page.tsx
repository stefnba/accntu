import { MainContent } from '@/components/layout/main';
import { Button } from '@/components/ui/button';

export default function TransactionPage() {
    return (
        <MainContent
            pageHeader={{
                title: 'Transactions',
                description: 'View and manage your transactions',
                actionBar: <Button>Add Transaction</Button>,
            }}
        >
            <div>Transactions</div>
        </MainContent>
    );
}
