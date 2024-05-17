import { accountActions } from '@/actions';
import { PageHeader } from '@/components/page/header';
import {
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    NavCard
} from '@/components/ui/card';
import { CreateConnectedBankTrigger } from '@/features/connectedBank/components/create-account/modal-trigger';
import { ListConnectedBanks } from '@/features/connectedBank/components/list-accounts';
import { LuPlus } from 'react-icons/lu';

export default async function AccountList() {
    const { data: accounts = [] } = await accountActions.list();

    const accountRender = accounts.map((account) => {
        return (
            <NavCard
                href={`account/${account.id}`}
                className="border border-primary"
                key={account.id}
            >
                <CardHeader>
                    <CardTitle>{account.name}</CardTitle>
                </CardHeader>
                <CardContent>
                    {account.type}
                    <CardDescription>{account.description}</CardDescription>
                </CardContent>
            </NavCard>
        );
    });

    return (
        <div>
            <PageHeader
                title="Bank Accounts"
                actionBar={<CreateConnectedBankTrigger />}
            />
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {accountRender}
            </div>
            <ListConnectedBanks />
        </div>
    );
}
