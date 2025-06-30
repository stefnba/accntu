import { AdminBankDetailsView } from '@/features/admin/components/global-bank/bank-details/bank-details-view';

export default function AdminBankPage({ params }: { params: { bankId: string } }) {
    return <AdminBankDetailsView bankId={params.bankId} />;
}
