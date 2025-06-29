import { MainContent } from '@/components/layout/main';
import { GlobalBankAccountDetailsView } from '@/features/admin/components/global-bank-account/global-bank-account-details/global-bank-account-details-view';

export default async function AdminGlobalBankAccountPage({
    params,
}: {
    params: { accountId: string; bankId: string };
}) {
    const { accountId, bankId } = await params;
    return (
        <MainContent>
            <GlobalBankAccountDetailsView accountId={accountId} bankId={bankId} />
        </MainContent>
    );
}
