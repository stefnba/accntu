'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Description, Subtitle } from '@/components/ui/font';
import { CreditCard } from 'lucide-react';
import { AccountCard } from '../bank-cards';
// import { TConnectedBankWithRelations } from '@/features/bank/server/db/schemas';

interface BankDetailsOverviewProps {
    bank: TConnectedBankWithRelations;
    bankId: string;
}

export const BankDetailsOverview = ({ bank, bankId }: BankDetailsOverviewProps) => {
    return (
        <div className="space-y-8">
            {/* Overview Stats */}
            {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-white border-gray-200 hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 mb-1">
                                    Total Balance
                                </p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {totalBalance.toLocaleString('en-US', {
                                        style: 'currency',
                                        currency: bank.globalBank?.currency || 'EUR',
                                    })}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                                <DollarSign className="h-6 w-6 text-blue-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white border-gray-200 hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 mb-1">
                                    Monthly Income
                                </p>
                                <p className="text-2xl font-bold text-green-600">+€0</p>
                                <p className="text-xs text-gray-400">No data yet</p>
                            </div>
                            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                                <TrendingUp className="h-6 w-6 text-green-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white border-gray-200 hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 mb-1">
                                    Monthly Expenses
                                </p>
                                <p className="text-2xl font-bold text-red-600">-€0</p>
                                <p className="text-xs text-gray-400">No data yet</p>
                            </div>
                            <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
                                <TrendingDown className="h-6 w-6 text-red-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white border-gray-200 hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 mb-1">
                                    Transactions
                                </p>
                                <p className="text-2xl font-bold text-gray-900">0</p>
                                <p className="text-xs text-gray-400">This month</p>
                            </div>
                            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                                <ArrowUpRight className="h-6 w-6 text-purple-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div> */}

            {/* Connected Accounts */}
            <div>
                <div className="mb-4 flex items-center justify-between">
                    <div>
                        <Subtitle>Connected Accounts</Subtitle>
                        <Description>
                            Manage your connected bank accounts and view their details
                        </Description>
                    </div>
                    {/* <Button className="gap-2">
                        <CreditCard className="h-4 w-4" />
                        Add Account
                    </Button> */}
                </div>

                {bank.connectedBankAccounts && bank.connectedBankAccounts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {bank.connectedBankAccounts.map((account) => (
                            <AccountCard key={account.id} account={account} bankId={bankId} />
                        ))}
                    </div>
                ) : (
                    <Card className="border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors bg-white">
                        <CardContent className="p-12 text-center">
                            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <CreditCard className="h-8 w-8 text-gray-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                No accounts connected yet
                            </h3>
                            <p className="text-gray-500 mb-6 max-w-md mx-auto">
                                Connect your first account to start tracking transactions and
                                managing your finances
                            </p>
                            <Button size="lg" className="px-8 gap-2">
                                <CreditCard className="h-4 w-4" />
                                Add Your First Account
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
};
