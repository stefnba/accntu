'use client';

import { HeaderActionButton } from '@/components/page/header';
import { Button } from '@/components/ui/button';
import { storeBankAccountCreate } from '@/features/connectedBank/store/account-create-modal';
import { LuPlus } from 'react-icons/lu';

export const CreateConnectedBankTrigger = () => {
    const { handleOpen } = storeBankAccountCreate();

    return (
        <HeaderActionButton
            label="Add Account"
            icon={LuPlus}
            onClick={handleOpen}
        />
    );
};
