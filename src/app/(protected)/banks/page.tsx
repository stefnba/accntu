import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { AddBankModal, BankList } from '@/features/bank/components';

export default function BankPage() {
    return (
        <div className="flex flex-col gap-6">
            <PageHeader
                title="Connected Banks"
                description="Manage your connected bank accounts and view your financial data"
                actionBar={<Button>Add Bank</Button>}
            />
            <BankList />
            <AddBankModal />
        </div>
    );
}
