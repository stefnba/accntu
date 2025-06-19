'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useConnectedBankEndpoints } from '@/features/bank/api';
import { BankBreadcrumb } from '@/features/bank/components/bank-breadcrumb';
import { BankDetailsTabNavigation } from '@/features/bank/components/bank-details';
import { useBankDetailsView } from '@/features/bank/hooks';
import { ArrowLeft, ArrowUpRight, Building2, DollarSign, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
    BankDetailsHeader,
    BankDetailsOverview,
    BankDetailsRecentActivity,
    BankDetailsSettings,
} from './bank-details';

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

    const totalBalance =
        bank.connectedBankAccounts?.reduce(
            (sum, account) =>
                sum + (account.currentBalance ? parseFloat(account.currentBalance.toString()) : 0),
            0
        ) || 0;

    const tabs = [
        { id: 'overview' as const, label: 'Overview', icon: DollarSign },
        { id: 'activity' as const, label: 'Recent Activity', icon: ArrowUpRight },
        { id: 'settings' as const, label: 'Settings', icon: Settings },
    ];

    return (
        <div className="w-full space-y-6">
            {/* Header */}
            <BankBreadcrumb className="" bankId={bankId} />

            <BankDetailsHeader bank={bank} />

            {/* Tab Navigation */}
            <BankDetailsTabNavigation />

            {/* Content */}
            <div className="bg-gray-50">
                {currentView === 'overview' && <BankDetailsOverview bank={bank} bankId={bankId} />}
                {currentView === 'activity' && <BankDetailsRecentActivity bank={bank} />}
                {currentView === 'settings' && <BankDetailsSettings bank={bank} />}
                {currentView === 'analytics' && <div>Analytics</div>}
            </div>
        </div>
    );
};
