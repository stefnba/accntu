'use client';

import { Textarea } from '@/components/ui/textarea';
import { useAdminGlobalBankAccountEndpoints } from '@/features/admin/api/global-bank-account';
import { SqlEditor } from '@/features/admin/components/sql-editor';

export const AdminGlobalBankAccountDetailsView = ({ bankAccountId }: { bankAccountId: string }) => {
    const { data: bankAccount } = useAdminGlobalBankAccountEndpoints.getById({
        param: { id: bankAccountId },
    });

    if (!bankAccount) {
        return <div>Bank account not found</div>;
    }

    return (
        <div>
            <h1 className="text-2xl font-bold">{bankAccount?.name}</h1>
            <p className="text-sm text-gray-500">{bankAccount?.type}</p>

            <Textarea
                value={bankAccount?.sampleTransformData ?? ''}
                className="w-full h-40"
                readOnly
            />

            <pre>{JSON.stringify(bankAccount?.transformConfig, null, 2)}</pre>

            <SqlEditor
                height={500}
                value={bankAccount?.transformQuery}
                onChange={(value) => {
                    console.log(value);
                }}
            />
        </div>
    );
};
