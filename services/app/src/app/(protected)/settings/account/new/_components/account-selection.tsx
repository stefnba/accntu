import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import db from '@/db';

import { AccountSelectionForm } from './account-selection-form';

interface Props {
    bankId: string;
}

export const AccountSelection = async ({ bankId }: Props) => {
    const bank = await db.bank.findUnique({ where: { id: bankId } });

    const accounts = await db.bankUploadAccounts.findMany({
        where: {
            bankId
        }
    });

    return (
        <div>
            <Link
                href={{
                    pathname: '/settings/account/new',
                    query: {}
                }}
            >
                <Button>Back</Button>
            </Link>
            <div>
                <div className="text-4xl mt-8">{bank?.name}</div>
                <AccountSelectionForm bankId={bankId} accounts={accounts} />
            </div>
        </div>
    );
};
