import { MainContent } from '@/components/layout/main';
import { AccountDetailsView } from '@/features/bank/components';

interface AccountPageProps {
    params: Promise<{
        bankId: string;
        accountId: string;
    }>;
}

export default async function AccountPage({ params }: AccountPageProps) {
    const { bankId, accountId } = await params;

    return (
        <MainContent>
            <AccountDetailsView bankId={bankId} accountId={accountId} />
        </MainContent>
    );
}
