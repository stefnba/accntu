'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, CreditCard, Settings, Users } from 'lucide-react';
import { useState } from 'react';
import { GlobalBankManager } from './global-bank';
import { GlobalBankAccountManager } from './global-bank-account';

export const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('banks');

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <Settings className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-semibold text-gray-900">Admin Dashboard</h1>
                        <p className="text-gray-600">
                            Manage global bank templates and account configurations
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-gray-200">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-medium text-gray-600">
                                Global Banks
                            </CardTitle>
                            <Building2 className="h-4 w-4 text-blue-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">12</div>
                        <p className="text-xs text-gray-500">Bank templates configured</p>
                    </CardContent>
                </Card>

                <Card className="border-gray-200">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-medium text-gray-600">
                                Account Templates
                            </CardTitle>
                            <CreditCard className="h-4 w-4 text-green-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">48</div>
                        <p className="text-xs text-gray-500">Account configurations</p>
                    </CardContent>
                </Card>

                <Card className="border-gray-200">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-medium text-gray-600">
                                Active Users
                            </CardTitle>
                            <Users className="h-4 w-4 text-purple-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">1,234</div>
                        <p className="text-xs text-gray-500">Connected users</p>
                    </CardContent>
                </Card>

                <Card className="border-gray-200">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-medium text-gray-600">
                                Integration Types
                            </CardTitle>
                            <Settings className="h-4 w-4 text-orange-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">4</div>
                        <p className="text-xs text-gray-500">CSV, API, Plaid, Open Banking</p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="p-6">
                    <TabsList className="grid grid-cols-2 w-full max-w-md">
                        <TabsTrigger value="banks" className="flex items-center gap-2">
                            <Building2 className="h-4 w-4" />
                            Banks
                        </TabsTrigger>
                        <TabsTrigger value="accounts" className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4" />
                            Accounts
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="banks" className="mt-6">
                        <GlobalBankManager />
                    </TabsContent>

                    <TabsContent value="accounts" className="mt-6">
                        <GlobalBankAccountManager />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};
