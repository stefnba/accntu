'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAdminGlobalBankAccountEndpoints } from '@/features/admin/api/global-bank-account';
import {
    CreditCard,
    Database,
    Eye,
    FileText,
    PiggyBank,
    Plus,
    TrendingUp,
    Wallet,
} from 'lucide-react';
import Link from 'next/link';

interface GlobalBankAccountListProps {
    bankId: string;
    onAdd?: () => void;
}

export const GlobalBankAccountList = ({ bankId, onAdd }: GlobalBankAccountListProps) => {
    const { data: accounts, isLoading } = useAdminGlobalBankAccountEndpoints.getMany(
        { query: { globalBankId: bankId } },
        { enabled: !!bankId }
    );

    const getAccountTypeIcon = (type: string) => {
        switch (type) {
            case 'checking':
                return <Wallet className="h-4 w-4" />;
            case 'savings':
                return <PiggyBank className="h-4 w-4" />;
            case 'credit_card':
                return <CreditCard className="h-4 w-4" />;
            case 'investment':
                return <TrendingUp className="h-4 w-4" />;
            default:
                return <Wallet className="h-4 w-4" />;
        }
    };

    const getAccountTypeLabel = (type: string) => {
        switch (type) {
            case 'checking':
                return 'Checking';
            case 'savings':
                return 'Savings';
            case 'credit_card':
                return 'Credit Card';
            case 'investment':
                return 'Investment';
            default:
                return type;
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                    <Card key={i} className="animate-pulse border-gray-200">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-gray-200 rounded-xl" />
                                <div className="space-y-2 flex-1">
                                    <div className="h-4 bg-gray-200 rounded w-1/3" />
                                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    if (!accounts || accounts.length === 0) {
        return (
            <div className="text-center py-12">
                <CreditCard className="h-16 w-16 text-gray-300 mx-auto mb-6" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No account templates found
                </h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                    Create your first account template for this bank
                </p>
                {onAdd && (
                    <Button onClick={onAdd} className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Template
                    </Button>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {accounts.map((account) => (
                <Card
                    key={account.id}
                    className="group hover:shadow-md transition-all duration-200 border-gray-200 hover:border-blue-300"
                >
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                                    {getAccountTypeIcon(account.type)}
                                </div>
                                <div className="space-y-1">
                                    <h3 className="font-semibold text-gray-900">{account.name}</h3>
                                    <div className="flex items-center gap-2">
                                        <Badge
                                            variant="secondary"
                                            className="flex items-center gap-1 bg-gray-100 text-gray-700"
                                        >
                                            {getAccountTypeIcon(account.type)}
                                            {getAccountTypeLabel(account.type)}
                                        </Badge>
                                        {account.csvColumns && (
                                            <Badge
                                                variant="outline"
                                                className="flex items-center gap-1 border-green-200 text-green-700"
                                            >
                                                <FileText className="h-3 w-3" />
                                                CSV Config
                                            </Badge>
                                        )}
                                        <Badge
                                            variant="outline"
                                            className="flex items-center gap-1 border-blue-200 text-blue-700"
                                        >
                                            <Database className="h-3 w-3" />
                                            {account.csvColumns
                                                ? Object.keys(account.csvColumns).length
                                                : 0}{' '}
                                            columns
                                        </Badge>
                                    </div>
                                    {account.description && (
                                        <p className="text-sm text-gray-500 line-clamp-1">
                                            {account.description}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
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
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    asChild
                                    className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-50 hover:text-blue-600"
                                >
                                    <Link href={`/admin/banks/${bankId}/accounts/${account.id}`}>
                                        <Eye className="h-4 w-4" />
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};
