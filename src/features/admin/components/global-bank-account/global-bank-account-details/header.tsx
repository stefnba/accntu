'use client';

import { CardHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CreditCard, Edit, PiggyBank, Settings, TrendingUp, Wallet } from 'lucide-react';

interface GlobalBankAccountDetailsHeaderProps {
    account: any;
    bank?: any;
    onEdit?: () => void;
}

export const GlobalBankAccountDetailsHeader = ({
    account,
    bank,
    onEdit,
}: GlobalBankAccountDetailsHeaderProps) => {
    const getAccountTypeIcon = (type: string) => {
        switch (type) {
            case 'checking':
                return <Wallet className="h-10 w-10 text-blue-600" />;
            case 'savings':
                return <PiggyBank className="h-10 w-10 text-green-600" />;
            case 'credit_card':
                return <CreditCard className="h-10 w-10 text-purple-600" />;
            case 'investment':
                return <TrendingUp className="h-10 w-10 text-orange-600" />;
            default:
                return <Wallet className="h-10 w-10 text-gray-600" />;
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
        <CardHeader
            title={account.name}
            description={account.description}
            icon={<CreditCard className="h-10 w-10 text-gray-600" />}
        />
    );

    return (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm">
            <div className="p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <div className="size-20 rounded-2xl bg-gray-50 flex items-center justify-center shadow-sm border">
                            {getAccountTypeIcon(account.type)}
                        </div>
                        <div>
                            <h1 className="text-3xl font-semibold text-gray-900 mb-2">
                                {account.name}
                            </h1>
                            <div className="flex items-center gap-4 text-gray-600 text-sm">
                                <Badge
                                    variant="outline"
                                    className={
                                        account.isActive
                                            ? 'bg-green-50 text-green-700 border-green-200'
                                            : 'bg-red-50 text-red-700 border-red-200'
                                    }
                                >
                                    {account.isActive ? 'Active' : 'Inactive'}
                                </Badge>
                                <span className="flex items-center gap-1">
                                    {getAccountTypeIcon(account.type)}
                                    {getAccountTypeLabel(account.type)}
                                </span>
                                {bank && (
                                    <>
                                        <span className="text-gray-300">•</span>
                                        <span className="font-medium">{bank.name}</span>
                                    </>
                                )}
                                <span className="text-gray-300">•</span>
                                <span>
                                    Template created{' '}
                                    {new Date(account.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {onEdit && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={onEdit}
                                className="gap-2 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300"
                            >
                                <Edit className="h-4 w-4" />
                                Edit
                            </Button>
                        )}
                        <Button variant="outline" size="sm" disabled className="gap-2">
                            <Settings className="h-4 w-4" />
                            Settings
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
