import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { AccountDetailsView, BankBreadcrumb } from '@/features/bank/components';

interface AccountPageProps {
    params: {
        bankId: string;
        accountId: string;
    };
}

export default function AccountPage({ params }: AccountPageProps) {
    return (
        <div className="flex flex-col gap-6">
            <BankBreadcrumb bankId={params.bankId} accountId={params.accountId} />
            <PageHeader
                title="Account Details"
                description="View account information, transactions, and analytics"
                actionBar={
                    <div className="flex gap-2">
                        <Button variant="outline">Export Data</Button>
                        <Button variant="outline">Sync Transactions</Button>
                        <Button>Edit Account</Button>
                    </div>
                }
            />
            <AccountDetailsView bankId={params.bankId} accountId={params.accountId} />
        </div>
    );
}
