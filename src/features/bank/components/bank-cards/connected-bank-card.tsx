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
    ChevronRight,
    CreditCard,
    MoreHorizontal,
    TrendingUp,
    Wallet,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface ConnectedBankCardProps {
    bank: {
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date | null;
        globalBank: {
            id: string;
            name: string;
            country: string | null;
            currency: string;
            logo: string | null;
            color: string | null;
        } | null;
        connectedBankAccounts: Array<{
            id: string;
            type: string | null;
            currentBalance: string | null;
        }>;
    };
}

const getAccountTypeIcon = (type: string) => {
    switch (type) {
        case 'checking':
            return <Wallet className="h-4 w-4" />;
        case 'savings':
            return <Building2 className="h-4 w-4" />;
        case 'credit_card':
            return <CreditCard className="h-4 w-4" />;
        case 'investment':
            return <TrendingUp className="h-4 w-4" />;
        default:
            return <Wallet className="h-4 w-4" />;
    }
};

const getAccountTypeColor = (type: string) => {
    switch (type) {
        case 'checking':
            return 'bg-blue-50 text-blue-600 border-blue-200';
        case 'savings':
            return 'bg-green-50 text-green-600 border-green-200';
        case 'credit_card':
            return 'bg-purple-50 text-purple-600 border-purple-200';
        case 'investment':
            return 'bg-orange-50 text-orange-600 border-orange-200';
        default:
            return 'bg-gray-50 text-gray-600 border-gray-200';
    }
};

export const ConnectedBankCard = ({ bank }: ConnectedBankCardProps) => {
    const router = useRouter();

    const accountTypeCounts = bank.connectedBankAccounts.reduce(
        (acc, account) => {
            const type = account.type || 'unknown';
            acc[type] = (acc[type] || 0) + 1;
            return acc;
        },
        {} as Record<string, number>
    );

    const totalBalance = bank.connectedBankAccounts.reduce((sum, account) => {
        return sum + (account.currentBalance ? parseFloat(account.currentBalance.toString()) : 0);
    }, 0);

    return (
        <Card className="group transition-all duration-200 hover:shadow-lg hover:shadow-gray-100 border-gray-200 relative">
            <Link href={`/banks/${bank.id}`} className="block">
                <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                            {bank.globalBank?.logo ? (
                                <div
                                    className="w-12 h-12 rounded-lg flex items-center justify-center"
                                    style={{ backgroundColor: bank.globalBank.color || '#f3f4f6' }}
                                >
                                    <img
                                        src={bank.globalBank.logo}
                                        alt={bank.globalBank.name}
                                        className="w-8 h-8 object-contain"
                                    />
                                </div>
                            ) : (
                                <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                                    <Building2 className="h-6 w-6 text-gray-600" />
                                </div>
                            )}
                            <div>
                                <h3 className="font-semibold text-lg text-gray-900 group-hover:text-gray-700">
                                    {bank.globalBank?.name || 'Unknown Bank'}
                                </h3>
                                <p className="text-sm text-gray-500">
                                    {bank.connectedBankAccounts.length} account
                                    {bank.connectedBankAccounts.length !== 1 ? 's' : ''}
                                    {bank.globalBank?.country &&
                                        ` • ${bank.globalBank.country.toUpperCase()}`}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="opacity-0 group-hover:opacity-100 transition-opacity relative z-10"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            router.push(`/banks/${bank.id}/settings`);
                                        }}
                                    >
                                        Edit Bank
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="text-red-600">
                                        Disconnect Bank
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                        </div>
                    </div>

                    {/* Account Types Summary */}
                    <div className="flex flex-wrap gap-2 mb-4">
                        {Object.entries(accountTypeCounts).map(([type, count]) => (
                            <Badge
                                key={type}
                                variant="outline"
                                className={cn('text-xs', getAccountTypeColor(type))}
                            >
                                <span className="mr-1">{getAccountTypeIcon(type)}</span>
                                {type.replace('_', ' ')} ({count})
                            </Badge>
                        ))}
                    </div>

                    {/* Total Balance */}
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Total Balance</p>
                            <p className="text-xl font-semibold text-gray-900">
                                {totalBalance.toLocaleString('en-US', {
                                    style: 'currency',
                                    currency: bank.globalBank?.currency || 'EUR',
                                })}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-500">Last updated</p>
                            <p className="text-sm text-gray-600">
                                {new Date(bank.updatedAt || bank.createdAt).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Link>
        </Card>
    );
};
