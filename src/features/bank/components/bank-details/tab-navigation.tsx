'use client';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useBankDetailsView, type TBankDetailsView } from '@/features/bank/hooks';

export const BankDetailsTabNavigation = () => {
    const { setView, views, currentView } = useBankDetailsView();

    return (
        <Tabs
            value={currentView}
            onValueChange={(value: string) => setView(value as TBankDetailsView)}
        >
            <TabsList className="">
                <TabsTrigger value={views[0]}>Overview</TabsTrigger>
                <TabsTrigger value={views[1]}>Transactions</TabsTrigger>
                <TabsTrigger value={views[2]}>Analytics</TabsTrigger>
                <TabsTrigger value={views[3]}>Settings</TabsTrigger>
            </TabsList>
        </Tabs>
    );
};
