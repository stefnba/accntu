import { AdminBankDetailsView } from '@/features/admin/components/global-bank/bank-details/bank-details-view';

export default async function AdminBankPage({ params }: { params: Promise<{ bankId: string }> }) {
    const { bankId } = await params;
    return <AdminBankDetailsView bankId={bankId} />;
}
