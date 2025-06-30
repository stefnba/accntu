'use client';

import { useAdminGlobalBankAccountEndpoints } from '@/features/admin/api/global-bank-account';
import { SampleDataSection } from '@/features/admin/components/global-bank-account/global-bank-account-details/sample-data-section';
import { SqlQueryEditor } from '@/features/admin/components/global-bank-account/global-bank-account-details/sql-query-editor';
import { TransformationConfiguration } from '@/features/admin/components/global-bank-account/global-bank-account-details/transformation-configuration';
import { useState } from 'react';

interface GlobalBankAccountDetailsTransformationProps {
    accountId: string;
    bankId: string;
}

export const GlobalBankAccountDetailsTransformation: React.FC<
    GlobalBankAccountDetailsTransformationProps
> = ({ accountId }) => {
    const [isSampleDataOpen, setIsSampleDataOpen] = useState(false);

    const { data: account } = useAdminGlobalBankAccountEndpoints.getById({
        param: { id: accountId },
    });

    if (!account) {
        return <div>Account not found</div>;
    }

    return (
        <div>
            <div className="flex justify-between items-center">
                <div className="text-2xl font-semibold mb-4">Transformation Configuration</div>
                <div className="text-sm text-gray-600">Each section can be saved independently</div>
            </div>

            <div className="space-y-4">
                {/* Top row with Configuration and SQL Query */}
                <div className="flex gap-4 md:flex-row flex-col">
                    <TransformationConfiguration accountId={accountId} />
                    <SqlQueryEditor accountId={accountId} />
                </div>

                {/* Bottom row with Sample Transform Data - Collapsible */}
                <SampleDataSection
                    accountId={accountId}
                    isOpen={isSampleDataOpen}
                    onOpenChange={setIsSampleDataOpen}
                />
            </div>
        </div>
    );
};
