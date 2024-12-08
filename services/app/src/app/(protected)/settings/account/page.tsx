import { PageHeader } from '@components/page/header';
import { ListConnectedBanks } from '@features/connectedBank/components/account-list';
import { CreateBankAccountModal } from '@features/connectedBank/components/create-account/modal';
import { CreateConnectedBankTrigger } from '@features/connectedBank/components/create-account/modal-trigger';
import { ViewUpdateConnectedBankSheet } from '@features/connectedBank/components/update-account/sheet';

export default async function AccountList() {
    return (
        <>
            <PageHeader
                title="Bank Accounts"
                actionBar={<CreateConnectedBankTrigger />}
            />
            <ListConnectedBanks />
            <CreateBankAccountModal />
            <ViewUpdateConnectedBankSheet />
        </>
    );
}
