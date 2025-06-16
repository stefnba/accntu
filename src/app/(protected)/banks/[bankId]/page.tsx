import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { BankBreadcrumb, BankDetailsView } from '@/features/bank/components';

interface BankPageProps {
    params: {
        bankId: string;
    };
}

export default function BankPage({ params }: BankPageProps) {
    return (
        <div className="flex flex-col gap-6">
            <BankBreadcrumb bankId={params.bankId} />
            <PageHeader
                title="Bank Details"
                description="View and manage bank accounts and transactions"
                actionBar={
                    <div className="flex gap-2">
                        <Button variant="outline">Refresh Data</Button>
                        <Button>Add Account</Button>
                    </div>
                }
            />
            <BankDetailsView bankId={params.bankId} />
        </div>
    );
}
