'use client';

import { useGetConnectedBanks } from '@/features/connectedBank/api/get-connected-banks';
import { BankCard } from '@/features/connectedBank/components/bank-card';
import { storeUpdateConnectedBankSheet } from '@/features/connectedBank/store/update-bank-sheet';

export const ListConnectedBanks = () => {
    const { data, isLoading } = useGetConnectedBanks();
    const { handleOpen } = storeUpdateConnectedBankSheet();

    if (isLoading) return <div>Loading...</div>;

    return (
        <div className="py-2 grid 2xl:grid-cols-5 xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-4">
            {data?.map((r) => (
                <div key={r.id} onClick={() => handleOpen(r.id)}>
                    <BankCard
                        record={{
                            id: r.bank.id,
                            name: r.bank.name,
                            logo: r.bank.logo,
                            color: r.bank.color,
                            accounts: r.accounts
                        }}
                    />
                </div>
            ))}
        </div>
    );
};
