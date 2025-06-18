import { MainContent } from '@/components/layout/main';
import { BankDetailsView } from '@/features/bank/components';

interface BankPageProps {
    params: {
        bankId: string;
    };
}

export default async function BankPage({ params }: BankPageProps) {
    const { bankId } = await params;
    return (
        <MainContent limitWidth={true}>
            <BankDetailsView bankId={bankId} />
        </MainContent>
    );
}
