import { PageHeader } from '@/components/page/header';
import { CreateConnectedBankTrigger } from '@/features/connectedBank/components/create-account/modal-trigger';
import { ListConnectedBanks } from '@/features/connectedBank/components/list-accounts';

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
