import { MainContent } from '@/components/layout/main';
import { Button } from '@/components/ui/button';
import { AddBankModal } from '@/features/bank/components';
import { ConnectedBanksList } from '@/features/bank/components/connected-banks-list';

export default function BanksPage() {
    return (
        <MainContent
            pageHeader={{
                title: 'Connected Banks',
                description: 'Manage your connected banks and view account information',
                actionBar: <Button>Add Bank</Button>,
            }}
        >
            <ConnectedBanksList />
            <AddBankModal />
        </MainContent>
    );
}
