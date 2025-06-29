'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GlobalBankManager } from '@/features/admin/components/global-bank-manager';
import { GlobalBankAccountManager } from '@/features/admin/components/global-bank-account-manager';

export default function AdminPage() {
    const [activeTab, setActiveTab] = useState('banks');

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Global Bank Management</h1>
                <p className="text-muted-foreground">Manage global banks and bank accounts</p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                    <TabsTrigger value="banks">Global Banks</TabsTrigger>
                    <TabsTrigger value="accounts">Bank Accounts</TabsTrigger>
                </TabsList>

                <TabsContent value="banks" className="mt-6">
                    <GlobalBankManager />
                </TabsContent>

                <TabsContent value="accounts" className="mt-6">
                    <GlobalBankAccountManager />
                </TabsContent>
            </Tabs>
        </div>
    );
}
