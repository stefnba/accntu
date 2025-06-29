import { MainContent } from '@/components/layout/main';
import { Button } from '@/components/ui/button';
import { GlobalBankList } from '@/features/admin/components/global-bank/bank-list';

export default function AdminBanksPage() {
    return (
        <MainContent
            variant="light"
            pageHeader={{
                title: 'Global Banks',
                description: 'Manage global banks and their accounts',
                actionBar: <Button>Add Global Bank</Button>,
            }}
        >
            <GlobalBankList />
        </MainContent>
    );
}
