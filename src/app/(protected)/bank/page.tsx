import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';

export default function BankPage() {
    return (
        <div className="flex flex-col gap-4">
            <PageHeader title="Connected Banks" actionBar={<Button>Add Bank</Button>} />
        </div>
    );
}
