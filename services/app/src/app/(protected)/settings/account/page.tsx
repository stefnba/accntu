import { PageHeader } from '@/components/page/header';
import { ListConnectedBanks } from '@/features/connectedBank/components/account-list';
import { CreateConnectedBankTrigger } from '@/features/connectedBank/components/create-account/modal-trigger';

export default async function AccountList() {
    return (
        <div>
            <PageHeader
                title="Bank Accounts"
                actionBar={<CreateConnectedBankTrigger />}
            />

            <ListConnectedBanks />
        </div>
    );
}
