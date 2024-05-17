'use client';

import { useGetBanks } from '@/features/bank/api';
import { BankAccountCard } from '@/features/connectedBank/components/account-card';
import { storeBankAccountCreate } from '@/features/connectedBank/store/account-create-modal';
import React from 'react';

interface Props {}

export const BankSelection: React.FC<Props> = () => {
    const country = storeBankAccountCreate((store) => store.country);
    const setBank = storeBankAccountCreate((store) => store.setBank);

    const { data, error } = useGetBanks({ country });

    if (!data || error) {
        return <div>Error {error?.message}</div>;
    }

    return (
        <div className="mt-4 grid grid-cols-2 gap-2">
            {data?.map((b) => (
                <BankAccountCard
                    key={b.id}
                    label={b.name}
                    onClick={() => setBank(b.id)}
                />
            ))}
        </div>
    );
};
