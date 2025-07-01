import { TransactionTable } from '@/features/transaction/components/transaction-table';

export default function TransactionsPage() {
    return (
        <div className="container mx-auto py-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
                <p className="text-muted-foreground">
                    View and manage your financial transactions
                </p>
            </div>
            
            <TransactionTable />
        </div>
    );
}