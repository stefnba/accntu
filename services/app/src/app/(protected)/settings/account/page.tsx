import Link from 'next/link';

import { accountActions } from '@/actions';
import { PageHeader } from '@/components/page/header';
import {
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    NavCard
} from '@/components/ui/card';

export default async function AccountList() {
    const { success: accounts = [] } = await accountActions.list();

    const accountRender = accounts.map((account) => {
        return (
            <NavCard
                href={`account/${account.id}`}
                className="border border-primary"
                key={account.id}
            >
                <CardHeader>
                    <CardTitle>{account.name}</CardTitle>
                </CardHeader>
                <CardContent>
                    {account.type}
                    <CardDescription>{account.description}</CardDescription>
                </CardContent>
            </NavCard>
        );
    });

    return (
        <div>
            <PageHeader title="Accounts" />
            <Link href="account/new">New</Link>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {accountRender}
            </div>
        </div>
    );
}
