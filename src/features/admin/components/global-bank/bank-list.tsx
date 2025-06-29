'use client';

import { useAdminGlobalBankEndpoints } from '@/features/admin/api/global-bank';
import Link from 'next/link';

export const GlobalBankList = () => {
    const { data: globalBanks } = useAdminGlobalBankEndpoints.getAll({});

    return (
        <div className="flex flex-col gap-4">
            {globalBanks?.map((bank) => (
                <div key={bank.id}>
                    <Link href={`/admin/banks/${bank.id}`}>{bank.name}</Link>
                </div>
            ))}
        </div>
    );
};
