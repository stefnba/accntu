'use client';

import { Input } from '@/components/ui/input';
import { useGetBanks } from '@/features/bank/api';
import { BankCard } from '@/features/connectedBank/components/bank-card';
import { storeBankAccountCreate } from '@/features/connectedBank/store/account-create-modal';
import { Search } from 'lucide-react';
import React from 'react';

interface Props {}

export const BankSelection: React.FC<Props> = () => {
    const { setBank, setStep } = storeBankAccountCreate();

    const { data, error } = useGetBanks();

    if (!data || error) {
        return <div>Error {error?.message}</div>;
    }

    const handleCardClick = (id: string) => {
        setBank(id);
        setStep('account-selection');
    };

    return (
        <div>
            {/* <div className="mt-4 mb-2 text-2xl font-semibold">Providers</div> */}
            <div className="relative mb-4">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search" className="pl-8" />
            </div>
            <div className="py-2 grid md:grid-cols-2 grid-cols-1 gap-4">
                {data?.map((b) => (
                    <div key={b.id} onClick={() => handleCardClick(b.id)}>
                        <BankCard
                            record={{
                                id: b.id,
                                name: b.name,
                                color: b.color,
                                logo: b.logo,
                                country: b.country
                            }}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};
