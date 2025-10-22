'use client';

import { CardHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useConnectedBankEndpoints } from '@/features/bank/api';
import { AccountCount } from '@/features/bank/components/account-count';
import { BankBreadcrumb } from '@/features/bank/components/bank-breadcrumb';
import { BankDetailsTabNavigation } from '@/features/bank/components/bank-details/tab-navigation';
import { BankLogo } from '@/features/bank/components/bank-logo';
import { IntegrationTypeBadge } from '@/features/bank/components/integration-type';
import { useBankDetailsView } from '@/features/bank/hooks';
import { ArrowLeft, Building2, FileText, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { BankDetailsAnalytics } from './analytics';
import { BankDetailsOverview } from './overview';
import { BankDetailsRecentActivity } from './recent-activity';
import { BankDetailsSettings } from './settings';

interface BankDetailsViewProps {
    bankId: string;
}

export const BankDetailsView = ({ bankId }: BankDetailsViewProps) => {
    const router = useRouter();
    const { currentView } = useBankDetailsView();

    const {
        data: bank,
        isLoading,
        error,
    } = useConnectedBankEndpoints.getById({
        param: {
            id: bankId,
        },
    });

    // ===============
    // LOADING
    // ===============
    if (isLoading) {
        return (
            <div className="min-h-screen">
                {/* Header Skeleton */}
                <div className="bg-white border-gray-200">
                    <div className="px-4 sm:px-6 lg:px-8 py-8">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gray-100 rounded-xl animate-pulse" />
                            <div className="space-y-2">
                                <div className="h-8 bg-gray-100 rounded w-48 animate-pulse" />
                                <div className="h-4 bg-gray-100 rounded w-32 animate-pulse" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Skeleton */}
                <div className="px-4 sm:px-6 lg:px-8 py-8 bg-gray-50">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <Card key={i} className="animate-pulse">
                                <CardContent className="p-6">
                                    <div className="space-y-2">
                                        <div className="h-4 bg-gray-100 rounded w-20" />
                                        <div className="h-6 bg-gray-100 rounded w-24" />
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // ===============
    // ERRORS
    // ===============
    if (error || !bank) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <Card className="max-w-md w-full mx-4">
                    <CardContent className="p-8 text-center">
                        <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Bank not found</h3>
                        <p className="text-gray-500 mb-6">
                            The requested bank could not be found or you don't have access to it.
                        </p>
                        <Button onClick={() => router.push('/banks')} className="w-full">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Banks
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const { globalBank, connectedBankAccounts, id, apiCredentials } = bank;

    const { name, logo, color, country, integrationTypes } = globalBank;

    // ===============
    // CONTENT
    // ===============
    return (
        <div className="w-full space-y-6">
            {/* Breadcrumb */}
            <BankBreadcrumb className="" bankId={bankId} />

            {/* Header */}
            <CardHeader
                title={bank.globalBank?.name || 'Unknown Bank'}
                description={
                    <div className="flex items-center gap-3">
                        <IntegrationTypeBadge integrationType={integrationTypes} />
                        <span className="text-gray-300">•</span>
                        <AccountCount count={connectedBankAccounts?.length} />
                        <span className="text-gray-300">•</span>
                        <span className="uppercase">{country}</span>
                    </div>
                }
                icon={
                    <BankLogo
                        logoUrl={bank.globalBank?.logo}
                        color={bank.globalBank?.color}
                        size="xl"
                        className="border-none"
                    />
                }
                actionBar={
                    <>
                        {integrationTypes === 'api' && (
                            <Button variant="outline" size="sm" className="gap-2">
                                <RefreshCw className="h-4 w-4" />
                                Sync
                            </Button>
                        )}
                        {integrationTypes === 'csv' && (
                            <Button variant="outline" size="sm" className="gap-2">
                                <FileText className="h-4 w-4" />
                                Upload
                            </Button>
                        )}
                    </>
                }
            />

            {/* Tab Navigation */}
            <BankDetailsTabNavigation />

            {/* Content */}
            <div className="bg-gray-50">
                {currentView === 'overview' && <BankDetailsOverview bankId={bankId} />}
                {currentView === 'activity' && <BankDetailsRecentActivity bank={bank} />}
                {currentView === 'settings' && <BankDetailsSettings bank={bank} />}
                {currentView === 'analytics' && <BankDetailsAnalytics />}
            </div>
        </div>
    );
};
