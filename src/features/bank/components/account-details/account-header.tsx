'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Building2, Copy, CreditCard, Eye, EyeOff, TrendingUp, Wallet } from 'lucide-react';
import { useState } from 'react';

interface AccountHeaderProps {
    account: {
        id: string;
        name: string;
        type: string | null;
        accountNumber: string | null;
        iban: string | null;
        currentBalance: string | null;
        currency: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date | null;
    };
}

const getAccountTypeIcon = (type: string) => {
    switch (type) {
        case 'checking':
            return <Wallet className="h-6 w-6" />;
        case 'savings':
            return <Building2 className="h-6 w-6" />;
        case 'credit_card':
            return <CreditCard className="h-6 w-6" />;
        case 'investment':
            return <TrendingUp className="h-6 w-6" />;
        default:
            return <Wallet className="h-6 w-6" />;
    }
};

const getAccountTypeColor = (type: string) => {
    switch (type) {
        case 'checking':
            return 'bg-blue-50 text-blue-700 border-blue-200';
        case 'savings':
            return 'bg-green-50 text-green-700 border-green-200';
        case 'credit_card':
            return 'bg-purple-50 text-purple-700 border-purple-200';
        case 'investment':
            return 'bg-orange-50 text-orange-700 border-orange-200';
        default:
            return 'bg-gray-50 text-gray-700 border-gray-200';
    }
};

export const AccountHeader = ({ account }: AccountHeaderProps) => {
    const [showFullAccountNumber, setShowFullAccountNumber] = useState(false);

    const formatAccountNumber = (accountNumber: string | null) => {
        if (!accountNumber) return 'N/A';
        if (showFullAccountNumber) return accountNumber;
        return `****${accountNumber.slice(-4)}`;
    };

    const formatBalance = (balance: string | null, currency: string | null) => {
        if (!balance) return 'N/A';
        const numBalance = parseFloat(balance);
        return numBalance.toLocaleString('en-US', {
            style: 'currency',
            currency: currency || 'EUR',
        });
    };

    const accountType = account.type || 'checking';

    return (
        <Card className="border-gray-200">
            <CardContent className="p-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <div
                            className={cn(
                                'p-4 rounded-2xl border-2',
                                getAccountTypeColor(accountType)
                            )}
                        >
                            {getAccountTypeIcon(accountType)}
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                {account.name}
                            </h1>
                            <div className="flex items-center gap-4 text-gray-600 mb-2">
                                <div className="flex items-center gap-2">
                                    <span>{formatAccountNumber(account.accountNumber)}</span>
                                    {account.accountNumber && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-5 w-5 p-0"
                                            onClick={() =>
                                                setShowFullAccountNumber(!showFullAccountNumber)
                                            }
                                        >
                                            {showFullAccountNumber ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </Button>
                                    )}
                                </div>
                                {account.iban && (
                                    <div className="flex items-center gap-2">
                                        <span>IBAN: {account.iban}</span>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-5 w-5 p-0"
                                            onClick={() =>
                                                navigator.clipboard.writeText(account.iban!)
                                            }
                                        >
                                            <Copy className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge
                                    variant="outline"
                                    className={getAccountTypeColor(accountType)}
                                >
                                    {accountType.replace('_', ' ')}
                                </Badge>
                                <Badge variant="outline" className="bg-green-50 text-green-700">
                                    {account.isActive ? 'Active' : 'Inactive'}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    <div className="text-right">
                        <p className="text-sm text-gray-500 mb-1">Current Balance</p>
                        <p className="text-4xl font-bold text-gray-900">
                            {formatBalance(account.currentBalance, account.currency)}
                        </p>
                        <p className="text-sm text-gray-500 mt-2">
                            Last updated:{' '}
                            {new Date(account.updatedAt || account.createdAt).toLocaleString()}
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
