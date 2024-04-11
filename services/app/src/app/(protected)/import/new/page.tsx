import Link from 'next/link';

import { PageHeader } from '@/components/page/header';
import { Button } from '@/components/ui/button';
import db from '@/db';
import { getUser } from '@/lib/auth';

import { ImportAccountSelected } from './_components/account-selected';
import { AccountSelection } from './_components/account-selection';
import { ImportUploadForm } from './_components/upload-form';

interface Props {
    searchParams: { accountId?: string; importId?: string };
}

export default async function NewImport({
    searchParams: { accountId, importId }
}: Props) {
    const user = await getUser();

    const accounts = await db.transactionAccount.findMany({
        where: {
            userId: user.id,
            isLeaf: false
        }
    });

    const selectedAccount = accounts.find((a) => a.id === accountId);

    return (
        <div className="w-[60%]">
            <PageHeader title="New Import" />

            {!accountId && !importId && (
                <AccountSelection accounts={accounts} />
            )}

            {accountId && selectedAccount && (
                <>
                    <ImportAccountSelected account={selectedAccount} />
                    <ImportUploadForm account={selectedAccount} />
                </>
            )}

            {accountId && !selectedAccount && <div>Account not found</div>}
        </div>
    );
}
