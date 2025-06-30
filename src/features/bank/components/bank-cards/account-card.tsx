'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import {
    Building2,
    Copy,
    CreditCard,
    Eye,
    EyeOff,
    MoreHorizontal,
    TrendingUp,
    Wallet,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

interface AccountCardProps {
    account: {
        id: string;
        name: string;
        type: string | null;
        accountNumber: string | null;
        iban: string | null;
        currentBalance: string | null;
        currency: string | null;
    };
    bankId: string;
}

const getAccountTypeIcon = (type: string) => {
    switch (type) {
        case 'checking':
            return <Wallet className="h-5 w-5" />;
        case 'savings':
            return <Building2 className="h-5 w-5" />;
        case 'credit_card':
            return <CreditCard className="h-5 w-5" />;
        case 'investment':
            return <TrendingUp className="h-5 w-5" />;
        default:
            return <Wallet className="h-5 w-5" />;
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

export const AccountCard = ({ account, bankId }: AccountCardProps) => {
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
        <Card className="group transition-all duration-200 hover:shadow-md hover:shadow-gray-100 border-gray-200 relative">
            <Link href={`/banks/${bankId}/accounts/${account.id}`} className="block">
                <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div
                                className={cn(
                                    'p-2 rounded-lg border',
                                    getAccountTypeColor(accountType)
                                )}
                            >
                                {getAccountTypeIcon(accountType)}
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 group-hover:text-gray-700">
                                    {account.name}
                                </h3>
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <span>{formatAccountNumber(account.accountNumber)}</span>
                                    {account.accountNumber && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-4 w-4 p-0 relative z-10"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                setShowFullAccountNumber(!showFullAccountNumber);
                                            }}
                                        >
                                            {showFullAccountNumber ? (
                                                <EyeOff className="h-3 w-3" />
                                            ) : (
                                                <Eye className="h-3 w-3" />
                                            )}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="opacity-0 group-hover:opacity-100 transition-opacity relative z-10"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                    }}
                                >
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem>Edit Account</DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600">
                                    Remove Account
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Current Balance</p>
                                <p className="text-xl font-semibold text-gray-900">
                                    {formatBalance(account.currentBalance, account.currency)}
                                </p>
                            </div>
                            <Badge variant="outline" className={getAccountTypeColor(accountType)}>
                                {accountType.replace('_', ' ')}
                            </Badge>
                        </div>

                        {account.iban && (
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <span>IBAN: {account.iban}</span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-4 w-4 p-0 relative z-10"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        navigator.clipboard.writeText(account.iban!);
                                    }}
                                >
                                    <Copy className="h-3 w-3" />
                                </Button>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Link>
        </Card>
    );
};
