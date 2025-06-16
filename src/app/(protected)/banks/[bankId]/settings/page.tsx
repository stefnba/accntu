import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { BankBreadcrumb, BankSettingsView } from '@/features/bank/components';

interface BankSettingsPageProps {
    params: {
        bankId: string;
    };
}

export default function BankSettingsPage({ params }: BankSettingsPageProps) {
    return (
        <div className="flex flex-col gap-6">
            <BankBreadcrumb bankId={params.bankId} />
            <PageHeader
                title="Bank Settings"
                description="Manage your bank connection settings and preferences"
                actionBar={
                    <div className="flex gap-2">
                        <Button variant="outline">Test Connection</Button>
                        <Button>Save Changes</Button>
                    </div>
                }
            />
            <BankSettingsView bankId={params.bankId} />
        </div>
    );
}
