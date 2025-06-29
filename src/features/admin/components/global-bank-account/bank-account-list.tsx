'use client';

import { useAdminGlobalBankAccountEndpoints } from '@/features/admin/api/global-bank-account';
import Link from 'next/link';
interface AdminGlobalBankAccountListProps {
    bankId: string;
}

export const AdminGlobalBankAccountList: React.FC<AdminGlobalBankAccountListProps> = ({
    bankId,
}) => {
    const { data: bankAccounts } = useAdminGlobalBankAccountEndpoints.getByBankId({
        param: { bankId },
    });

    return (
        <div className="flex flex-col gap-4">
            {bankAccounts?.map((bankAccount) => (
                <div key={bankAccount.id}>
                    <Link href={`/admin/banks/${bankId}/accounts/${bankAccount.id}`}>
                        {bankAccount.name}
                    </Link>
                </div>
            ))}
        </div>
    );
};
