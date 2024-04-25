import Link from 'next/link';

import { bankActions } from '@/actions';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

import { AccountSelectionForm } from './account-selection-form';

interface Props {
    bankId: string;
}

export const AccountSelection = async ({ bankId }: Props) => {
    const { data: bank } = await bankActions.findById({
        id: bankId
    });

    const { data: accounts } = await bankActions.findUploadAccountsByBankId({
        bankId
    });

    if (!bank || !accounts) {
        return null;
    }

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
