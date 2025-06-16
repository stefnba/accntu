import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { AddBankModal } from '@/features/bank/components';
import { ConnectedBanksList } from '@/features/bank/components/connected-banks-list';

export default function BanksPage() {
    return (
        <div className="flex flex-col gap-6">
            <PageHeader
                title="Connected Banks"
                description="Manage your connected banks and view account information"
                actionBar={<Button>Add Bank</Button>}
            />
            <ConnectedBanksList />
            <AddBankModal />
        </div>
    );
}
