'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useConnectedBankEndpoints } from '@/features/bank/api';
import { ArrowUpRight, Building2, CreditCard, RefreshCw, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { AccountCard } from './bank-cards';

interface BankDetailsViewProps {
    bankId: string;
}

export const BankDetailsView = ({ bankId }: BankDetailsViewProps) => {
    const router = useRouter();
    const {
        data: bank,
        isLoading,
        error,
    } = useConnectedBankEndpoints.getById({
        param: { id: bankId },
    });

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Card className="animate-pulse">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-gray-200 rounded-xl" />
                            <div className="space-y-2">
                                <div className="h-6 bg-gray-200 rounded w-48" />
                                <div className="h-4 bg-gray-200 rounded w-32" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <Card key={i} className="animate-pulse">
                            <CardContent className="p-6">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gray-200 rounded-lg" />
                                        <div className="space-y-2">
                                            <div className="h-4 bg-gray-200 rounded w-24" />
                                            <div className="h-3 bg-gray-200 rounded w-20" />
                                        </div>
                                    </div>
                                    <div className="h-6 bg-gray-200 rounded w-32" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    if (error || !bank) {
        return (
            <Card className="p-6">
                <div className="text-center">
                    <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Bank not found</h3>
                    <p className="text-gray-500 mb-4">
                        The requested bank could not be found or you don't have access to it.
                    </p>
                    <Button onClick={() => router.push('/banks')}>Back to Banks</Button>
                </div>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Bank Header */}
            <Card className="border-gray-200">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            {bank.globalBank?.logo ? (
                                <div
                                    className="w-16 h-16 rounded-xl flex items-center justify-center"
                                    style={{ backgroundColor: bank.globalBank.color || '#f3f4f6' }}
                                >
                                    <img
                                        src={bank.globalBank.logo}
                                        alt={bank.globalBank.name}
                                        className="w-10 h-10 object-contain"
                                    />
                                </div>
                            ) : (
                                <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center">
                                    <Building2 className="h-8 w-8 text-gray-600" />
                                </div>
                            )}
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">
                                    {bank.globalBank?.name || 'Unknown Bank'}
                                </h1>
                                <p className="text-gray-500">
                                    {bank.connectedBankAccounts?.length || 0} account(s) connected
                                    {bank.globalBank?.country &&
                                        ` • ${bank.globalBank.country.toUpperCase()}`}
                                </p>
                                <p className="text-sm text-gray-400 mt-1">
                                    Connected on {new Date(bank.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm">
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Sync Data
                            </Button>
                            <Button variant="outline" size="sm">
                                <Settings className="h-4 w-4 mr-2" />
                                Settings
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Connected Accounts */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">Connected Accounts</h2>
                    <Button size="sm">Add Account</Button>
                </div>

                {bank.connectedBankAccounts && bank.connectedBankAccounts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {bank.connectedBankAccounts.map((account) => (
                            <AccountCard key={account.id} account={account} bankId={bankId} />
                        ))}
                    </div>
                ) : (
                    <Card className="border-2 border-dashed border-gray-300">
                        <CardContent className="p-8 text-center">
                            <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                No accounts connected
                            </h3>
                            <p className="text-gray-500 mb-4">
                                Add your first account to start tracking transactions
                            </p>
                            <Button>Add Account</Button>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Transactions and Analytics */}
            <Tabs defaultValue="transactions" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="transactions">Recent Transactions</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                    <TabsTrigger value="settings">Bank Settings</TabsTrigger>
                </TabsList>

                <TabsContent value="transactions" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Transactions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-8">
                                <ArrowUpRight className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    No transactions yet
                                </h3>
                                <p className="text-gray-500">
                                    Transactions will appear here once your accounts start syncing
                                    data
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="analytics" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card>
                            <CardContent className="p-6">
                                <div className="text-center">
                                    <p className="text-sm text-gray-500">Total Balance</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {(
                                            bank.connectedBankAccounts?.reduce(
                                                (sum, account) =>
                                                    sum +
                                                    (account.currentBalance
                                                        ? parseFloat(
                                                              account.currentBalance.toString()
                                                          )
                                                        : 0),
                                                0
                                            ) || 0
                                        ).toLocaleString('en-US', {
                                            style: 'currency',
                                            currency: bank.globalBank?.currency || 'EUR',
                                        })}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="text-center">
                                    <p className="text-sm text-gray-500">Monthly Income</p>
                                    <p className="text-2xl font-bold text-green-600">+€0</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="text-center">
                                    <p className="text-sm text-gray-500">Monthly Expenses</p>
                                    <p className="text-2xl font-bold text-red-600">-€0</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="text-center">
                                    <p className="text-sm text-gray-500">Transactions</p>
                                    <p className="text-2xl font-bold text-gray-900">0</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="settings" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Bank Connection Settings</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="font-medium">Auto-sync transactions</h4>
                                    <p className="text-sm text-gray-500">
                                        Automatically sync new transactions daily
                                    </p>
                                </div>
                                <Button variant="outline" size="sm">
                                    Enable
                                </Button>
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="font-medium">Connection status</h4>
                                    <p className="text-sm text-gray-500">
                                        Last synced:{' '}
                                        {new Date(
                                            bank.updatedAt || bank.createdAt
                                        ).toLocaleString()}
                                    </p>
                                </div>
                                <Badge variant="outline" className="bg-green-50 text-green-700">
                                    Connected
                                </Badge>
                            </div>

                            <div className="pt-4 border-t">
                                <Button variant="destructive" size="sm">
                                    Disconnect Bank
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};
