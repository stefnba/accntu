import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';

export default function TransactionPage() {
    return (
        <div className="flex flex-col gap-4">
            <PageHeader title="Transaction Imports" actionBar={<Button>New Import</Button>} />
        </div>
    );
}
