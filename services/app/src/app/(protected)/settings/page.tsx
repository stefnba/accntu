import Link from 'next/link';

import { PageHeader } from '@/components/page/header';

export default async function AccountList() {
    return (
        <div>
            <PageHeader title="Settings" />
            <div>
                <Link href="/settings/account">Accounts</Link>
                <Link href="/settings/label">Labels</Link>
            </div>
        </div>
    );
}
