'use client';

import { Input } from '@/components/ui/input';
import { useGetBanks } from '@/features/bank/api';
import { BankCard } from '@/features/connectedBank/components/bank-card';
import { useCreateBankAccountModal } from '@/features/connectedBank/hooks/create-account-modal';
import {
    DialogDescription,
    DialogHeader,
    DialogTitle
} from '@components/ui/dialog';
import { Search } from 'lucide-react';
import React from 'react';

interface Props {}

export const BankSelection: React.FC<Props> = () => {
    const { setBankId, handleOpen } = useCreateBankAccountModal();

    const { data, error } = useGetBanks();

    if (!data || error) {
        return <div>Error {error?.message}</div>;
    }

    const handleCardClick = (id: string) => {
        setBankId(id);
        handleOpen('account-selection');
    };

    return (
        <>
            <DialogHeader>
                <DialogTitle>Add Bank Account</DialogTitle>
                <DialogDescription>
                    Click on a bank provider to continue
                </DialogDescription>
            </DialogHeader>
            <div className="relative mb-4 flex items-center">
                <Search className="size-4 left-2 absolute text-muted-foreground" />
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
        </>
    );
};
