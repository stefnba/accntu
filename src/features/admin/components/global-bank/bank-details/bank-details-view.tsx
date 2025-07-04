'use client';

import { useAdminGlobalBankEndpoints } from '@/features/admin/api/global-bank';
import { GlobalBankAccountList } from '@/features/admin/components/global-bank-account';

export const AdminBankDetailsView = ({ bankId }: { bankId: string }) => {
    const { data: bank } = useAdminGlobalBankEndpoints.getById({ param: { id: bankId } });

    return (
        <div>
            <h1 className="text-2xl font-bold">{bank?.name}</h1>
            <p className="text-sm text-gray-500">{bank?.country}</p>

            <GlobalBankAccountList bankId={bankId} />
        </div>
    );
};
