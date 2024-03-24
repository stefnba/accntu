import Link from 'next/link';

import { PageHeader } from '@/components/page/header';
import { Button } from '@/components/ui/button';

export default async function Import() {
    return (
        <div>
            <PageHeader title="Imports" />
            <Link href="/import/new">
                <Button size="sm">New Import</Button>
            </Link>
        </div>
    );
}
