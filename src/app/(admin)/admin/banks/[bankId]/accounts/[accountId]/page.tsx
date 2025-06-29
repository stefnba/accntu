import { AdminGlobalBankAccountDetailsView } from '@/features/admin/components/global-bank-account/bank-account-details/bank-account-details-view';

export default function AdminGlobalBankAccountPage({ params }: { params: { accountId: string } }) {
    return <AdminGlobalBankAccountDetailsView bankAccountId={params.accountId} />;
}
