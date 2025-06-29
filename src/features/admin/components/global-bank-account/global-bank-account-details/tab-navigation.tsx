'use client';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    type TGlobalBankAccountDetailsView,
    useGlobalBankAccountDetailsView,
} from '@/features/admin/hooks/global-bank-account';

export const AdminGlobalBankAccountDetailsTabNavigation = () => {
    const { setView, views, currentView } = useGlobalBankAccountDetailsView();

    return (
        <Tabs
            value={currentView}
            onValueChange={(value: string) => setView(value as TGlobalBankAccountDetailsView)}
        >
            <TabsList className="">
                <TabsTrigger value={views[0]}>Overview</TabsTrigger>
                <TabsTrigger value={views[1]}>Transformation</TabsTrigger>
                <TabsTrigger value={views[3]}>Analytics</TabsTrigger>
                <TabsTrigger value={views[4]}>Settings</TabsTrigger>
            </TabsList>
        </Tabs>
    );
};
