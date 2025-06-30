'use client';

import { useAdminGlobalBankEndpoints } from '@/features/admin/api/global-bank';
import { useAdminGlobalBankAccountEndpoints } from '@/features/admin/api/global-bank-account';
import { GlobalBankAccountDetailsHeader } from '@/features/admin/components/global-bank-account/global-bank-account-details/header';
import { GlobalBankAccountDetailsOverview } from '@/features/admin/components/global-bank-account/global-bank-account-details/overview';
import { GlobalBankAccountDetailsSettings } from '@/features/admin/components/global-bank-account/global-bank-account-details/settings';
import { AdminGlobalBankAccountDetailsTabNavigation } from '@/features/admin/components/global-bank-account/global-bank-account-details/tab-navigation';
import { GlobalBankAccountDetailsTransformation } from '@/features/admin/components/global-bank-account/global-bank-account-details/transform-view';
import { useGlobalBankAccountDetailsView } from '@/features/admin/hooks/global-bank-account';
import { AlertTriangle } from 'lucide-react';

interface GlobalBankAccountDetailsViewProps {
    accountId: string;
    bankId: string;
}

export const GlobalBankAccountDetailsView = ({
    accountId,
    bankId,
}: GlobalBankAccountDetailsViewProps) => {
    const { currentView } = useGlobalBankAccountDetailsView();
    const { data: account, isLoading } = useAdminGlobalBankAccountEndpoints.getById({
        param: { id: accountId },
    });

    const { data: bank } = useAdminGlobalBankEndpoints.getById(
        {
            param: { id: bankId },
        },
        { enabled: !!bankId }
    );

    const deleteAccount = useAdminGlobalBankAccountEndpoints.remove();

    const handleDelete = async () => {
        if (account) {
            await deleteAccount.mutateAsync({ param: { id: account.id } });
            // Redirect back to bank details or show success message
            window.history.back();
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 animate-pulse">
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 bg-gray-200 rounded-2xl" />
                        <div className="space-y-3">
                            <div className="h-8 bg-gray-200 rounded w-64" />
                            <div className="h-4 bg-gray-200 rounded w-96" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!account) {
        return (
            <div className="text-center py-12">
                <AlertTriangle className="h-16 w-16 text-gray-300 mx-auto mb-6" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Account template not found
                </h3>
                <p className="text-gray-500">The requested account template could not be found.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <GlobalBankAccountDetailsHeader account={account} bank={bank} />

            {/* Tab Navigation */}
            <AdminGlobalBankAccountDetailsTabNavigation />

            {/* Content */}
            {/* Content */}
            <div className="bg-gray-50">
                {currentView === 'overview' && (
                    <GlobalBankAccountDetailsOverview account={account} bank={bank} />
                )}
                {currentView === 'transformations' && (
                    <GlobalBankAccountDetailsTransformation accountId={accountId} bankId={bankId} />
                )}
                {currentView === 'settings' && (
                    <GlobalBankAccountDetailsSettings account={account} bank={bank} />
                )}
            </div>
        </div>
    );
};
