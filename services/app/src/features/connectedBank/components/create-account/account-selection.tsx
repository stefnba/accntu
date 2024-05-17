'use client';

import { useGetBank } from '@/features/bank/api';
import { storeBankAccountCreate } from '@/features/connectedBank/store/account-create-modal';

import { AccountSelectionForm } from './account-selection-form';

interface Props {}

export const AccountSelection: React.FC<Props> = () => {
    const bankId = storeBankAccountCreate((store) => store.bank);

    const { data: bank } = useGetBank({ id: bankId });

    if (!bank || !bankId) {
        return null;
    }

    return (
        <>
            {bank?.name}
            <AccountSelectionForm accounts={bank.accounts} bankId={bankId} />
        </>
    );
};
