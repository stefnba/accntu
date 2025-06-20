'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useConnectedBankAccountEndpoints } from '@/features/bank/api';
import { BankBreadcrumb } from '@/features/bank/components/bank-breadcrumb';
import {
    Activity,
    Building2,
    CreditCard,
    Download,
    Filter,
    Search,
    TrendingUp,
    Wallet,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { AccountHeader, AccountQuickStats, TransactionRow } from './account-details';

interface AccountDetailsViewProps {
    bankId: string;
    accountId: string;
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

export const AccountDetailsView = ({ bankId, accountId }: AccountDetailsViewProps) => {
    const router = useRouter();
    const [showFullAccountNumber, setShowFullAccountNumber] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const {
        data: account,
        isLoading,
        error,
    } = useConnectedBankAccountEndpoints.getById({
        param: { id: accountId },
    });

    const formatAccountNumber = (accountNumber: string | null) => {
        if (!accountNumber) return 'N/A';
        if (showFullAccountNumber) return accountNumber;
        return `****${accountNumber.slice(-4)}`;
    };

    const formatBalance = (balance: string | null, currency: string) => {
        if (!balance) return 'N/A';
        const numBalance = parseFloat(balance);
        return numBalance.toLocaleString('en-US', {
            style: 'currency',
            currency: currency || 'EUR',
        });
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                {/* Account Header Skeleton */}
                <Card className="animate-pulse">
                    <CardContent className="p-8">
                        <div className="flex items-center gap-6">
                            <div className="w-20 h-20 bg-gray-200 rounded-2xl" />
                            <div className="space-y-3">
                                <div className="h-8 bg-gray-200 rounded w-64" />
                                <div className="h-5 bg-gray-200 rounded w-48" />
                                <div className="h-4 bg-gray-200 rounded w-32" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Stats Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Card key={i} className="animate-pulse">
                            <CardContent className="p-6">
                                <div className="space-y-3">
                                    <div className="h-4 bg-gray-200 rounded w-20" />
                                    <div className="h-8 bg-gray-200 rounded w-24" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    if (error || !account) {
        return (
            <Card className="p-8">
                <div className="text-center">
                    <CreditCard className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Account not found</h3>
                    <p className="text-gray-500 mb-6">
                        The requested account could not be found or you don't have access to it.
                    </p>
                    <div className="flex gap-2 justify-center">
                        <Button variant="outline" onClick={() => router.push('/banks')}>
                            Back to Banks
                        </Button>
                        <Button onClick={() => router.push(`/banks/${bankId}`)}>
                            Back to Bank
                        </Button>
                    </div>
                </div>
            </Card>
        );
    }

    // Mock transactions data - replace with real data
    const mockTransactions = [
        {
            id: '1',
            amount: '-45.67',
            description: 'Grocery Store Purchase',
            date: new Date().toISOString(),
            category: 'Food & Dining',
            balance: account.currentBalance?.toString() || '0',
            currency: account.currency || 'EUR',
        },
        {
            id: '2',
            amount: '2500.00',
            description: 'Salary Deposit',
            date: new Date(Date.now() - 86400000).toISOString(),
            category: 'Income',
            balance: account.currentBalance
                ? (parseFloat(account.currentBalance.toString()) + 45.67).toString()
                : '0',
            currency: account.currency || 'EUR',
        },
        {
            id: '3',
            amount: '-120.00',
            description: 'Utility Bill Payment',
            date: new Date(Date.now() - 172800000).toISOString(),
            category: 'Bills & Utilities',
            balance: account.currentBalance
                ? (parseFloat(account.currentBalance.toString()) + 45.67 - 2500).toString()
                : '0',
            currency: account.currency || 'EUR',
        },
    ];

    return (
        <div className="space-y-6">
            {/* Breadcrumb */}
            <BankBreadcrumb bankId={bankId} accountId={accountId} />

            {/* Account Header */}
            <AccountHeader account={account} />

            {/* Quick Stats */}
            <AccountQuickStats />

            {/* Main Content Tabs */}
            <Tabs defaultValue="transactions" className="space-y-6">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="transactions">Transactions</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                    <TabsTrigger value="details">Account Details</TabsTrigger>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>

                <TabsContent value="transactions" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Transaction History</CardTitle>
                                <div className="flex items-center gap-2">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <Input
                                            placeholder="Search transactions..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-10 w-64"
                                        />
                                    </div>
                                    <Button variant="outline" size="sm">
                                        <Filter className="h-4 w-4 mr-2" />
                                        Filter
                                    </Button>
                                    <Button variant="outline" size="sm">
                                        <Download className="h-4 w-4 mr-2" />
                                        Export
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-1">
                                {mockTransactions.map((transaction) => (
                                    <TransactionRow
                                        key={transaction.id}
                                        transaction={transaction}
                                    />
                                ))}
                            </div>

                            {mockTransactions.length === 0 && (
                                <div className="text-center py-12">
                                    <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                        No transactions found
                                    </h3>
                                    <p className="text-gray-500">
                                        Transactions will appear here once your account starts
                                        syncing data
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="analytics" className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Spending Categories</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-center py-8">
                                    <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-500">
                                        Spending analytics will appear here once you have more
                                        transaction data
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Balance Trend</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-center py-8">
                                    <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-500">
                                        Balance trends will appear here once you have more
                                        historical data
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="details" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Account Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="font-medium text-gray-900 mb-3">
                                        Basic Information
                                    </h4>
                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-sm text-gray-500">Account Name</p>
                                            <p className="font-medium">{account.name}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Account Type</p>
                                            <p className="font-medium">
                                                {(account.type || 'checking').replace('_', ' ')}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Currency</p>
                                            <p className="font-medium">
                                                {account.currency || 'EUR'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Status</p>
                                            <Badge
                                                variant="outline"
                                                className="bg-green-50 text-green-700"
                                            >
                                                {account.isActive ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-medium text-gray-900 mb-3">
                                        Account Details
                                    </h4>
                                    <div className="space-y-3">
                                        {account.accountNumber && (
                                            <div>
                                                <p className="text-sm text-gray-500">
                                                    Account Number
                                                </p>
                                                <p className="font-medium">
                                                    {account.accountNumber}
                                                </p>
                                            </div>
                                        )}
                                        {account.iban && (
                                            <div>
                                                <p className="text-sm text-gray-500">IBAN</p>
                                                <p className="font-medium">{account.iban}</p>
                                            </div>
                                        )}
                                        <div>
                                            <p className="text-sm text-gray-500">Created</p>
                                            <p className="font-medium">
                                                {new Date(account.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Last Updated</p>
                                            <p className="font-medium">
                                                {new Date(
                                                    account.updatedAt || account.createdAt
                                                ).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {account.description && (
                                <div>
                                    <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                                    <p className="text-gray-600">{account.description}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="settings" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Account Settings</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="font-medium">Account Notifications</h4>
                                    <p className="text-sm text-gray-500">
                                        Get notified about new transactions and balance changes
                                    </p>
                                </div>
                                <Button variant="outline" size="sm">
                                    Configure
                                </Button>
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="font-medium">Auto-categorization</h4>
                                    <p className="text-sm text-gray-500">
                                        Automatically categorize transactions based on merchant and
                                        description
                                    </p>
                                </div>
                                <Button variant="outline" size="sm">
                                    Enable
                                </Button>
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="font-medium">Data Export</h4>
                                    <p className="text-sm text-gray-500">
                                        Export your transaction data in various formats
                                    </p>
                                </div>
                                <Button variant="outline" size="sm">
                                    <Download className="h-4 w-4 mr-2" />
                                    Export
                                </Button>
                            </div>

                            <div className="pt-6 border-t">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-medium text-red-600">Remove Account</h4>
                                        <p className="text-sm text-gray-500">
                                            Permanently remove this account from your connected
                                            accounts
                                        </p>
                                    </div>
                                    <Button variant="destructive" size="sm">
                                        Remove Account
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};
