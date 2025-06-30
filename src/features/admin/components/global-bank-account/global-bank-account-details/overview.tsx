'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GlobalBankAccountOverviewForm } from '@/features/admin/components/global-bank-account/global-bank-account-details/overview-form';
import { Calendar, Columns, CreditCard, Database, Info, Settings } from 'lucide-react';

interface GlobalBankAccountDetailsOverviewProps {
    account: any;
    bank?: any;
}

export const GlobalBankAccountDetailsOverview = ({
    account,
    bank,
}: GlobalBankAccountDetailsOverviewProps) => {
    const getAccountTypeIcon = (type: string) => {
        switch (type) {
            case 'checking':
                return <CreditCard className="h-4 w-4" />;
            case 'savings':
                return <Database className="h-4 w-4" />;
            case 'credit_card':
                return <CreditCard className="h-4 w-4" />;
            case 'investment':
                return <Settings className="h-4 w-4" />;
            default:
                return <CreditCard className="h-4 w-4" />;
        }
    };

    const getAccountTypeLabel = (type: string) => {
        switch (type) {
            case 'checking':
                return 'Checking Account';
            case 'savings':
                return 'Savings Account';
            case 'credit_card':
                return 'Credit Card';
            case 'investment':
                return 'Investment Account';
            default:
                return type;
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-gray-900">
                        <Info className="h-5 w-5 text-blue-600" />
                        Account Information
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <GlobalBankAccountOverviewForm accountId={account.id} />
                </CardContent>
            </Card>

            {/* Status & Metadata */}
            <Card className="border-gray-200">
                <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-gray-900">
                        <Calendar className="h-5 w-5 text-orange-600" />
                        Status & Metadata
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-3">
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                Status
                            </p>
                            <Badge
                                variant={account.isActive ? 'default' : 'destructive'}
                                className={
                                    account.isActive
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-red-100 text-red-800'
                                }
                            >
                                {account.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                Created
                            </p>
                            <p className="text-sm text-gray-900">
                                {new Date(account.createdAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                })}
                            </p>
                        </div>
                        {account.updatedAt !== account.createdAt && (
                            <div>
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                    Last Updated
                                </p>
                                <p className="text-sm text-gray-900">
                                    {new Date(account.updatedAt).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    })}
                                </p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* CSV Column Details */}
            {account.csvColumns && Object.keys(account.csvColumns).length > 0 && (
                <Card className="border-gray-200 md:col-span-2 lg:col-span-3">
                    <CardHeader className="pb-4">
                        <CardTitle className="flex items-center gap-2 text-gray-900">
                            <Columns className="h-5 w-5 text-indigo-600" />
                            CSV Column Mapping
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {Object.entries(account.csvColumns).map(([key, value]) => (
                                <div key={key} className="p-3 bg-gray-50 rounded-lg">
                                    <div className="space-y-1">
                                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                            Field Name
                                        </p>
                                        <p className="text-sm font-mono text-gray-900">{key}</p>
                                    </div>
                                    <div className="space-y-1 mt-2">
                                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                            CSV Column
                                        </p>
                                        <p className="text-sm text-gray-900">{value as string}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};
