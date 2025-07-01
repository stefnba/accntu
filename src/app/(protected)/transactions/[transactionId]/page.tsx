import { MainContent } from '@/components/layout/main';
import { TransactionDetailsView } from '@/features/transaction/components/transaction-details-view';

interface TransactionPageProps {
    params: {
        transactionId: string;
    };
}

export default async function TransactionPage({ params }: TransactionPageProps) {
    const { transactionId } = await params;
    return (
        <MainContent limitWidth={true}>
            <TransactionDetailsView transactionId={transactionId} />
        </MainContent>
    );
}