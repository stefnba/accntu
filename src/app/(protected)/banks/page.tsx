import { MainContent } from '@/components/layout/main';
import { AddBankButton, AddBankModal } from '@/features/bank/components';

import { ConnectedBanksList } from '@/features/bank/components/connected-banks-list';

export default function BanksPage() {
    return (
        <MainContent
            pageHeader={{
                title: 'Connected Banks',
                description: 'Manage your connected banks and view account information',
                actionBar: <AddBankButton />,
            }}
        >
            <ConnectedBanksList />
            <AddBankModal />
        </MainContent>
    );
}
