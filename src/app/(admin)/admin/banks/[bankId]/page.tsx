import { MainContent } from '@/components/layout/main';
import { Button } from '@/components/ui/button';
import { AdminBankDetailsView } from '@/features/admin/components/global-bank/bank-details/bank-details-view';

export default async function AdminBankPage({ params }: { params: Promise<{ bankId: string }> }) {
    const { bankId } = await params;
    return (
        <MainContent
            variant="light"
            pageHeader={{
                title: 'Global Banks',
                description: 'Manage global banks and their accounts',
                actionBar: <Button>Add Global Bank</Button>,
            }}
        >
            <AdminBankDetailsView bankId={bankId} />
        </MainContent>
    );
}
