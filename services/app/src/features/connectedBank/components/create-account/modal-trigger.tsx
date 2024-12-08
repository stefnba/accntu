'use client';

import { HeaderActionButton } from '@/components/page/header';
import { Button } from '@/components/ui/button';
import { LuPlus } from 'react-icons/lu';

import { useCreateBankAccountModal } from '../../hooks/create-account-modal';

export const CreateConnectedBankTrigger = () => {
    const { handleOpen } = useCreateBankAccountModal();

    return (
        <HeaderActionButton
            label="Add Account"
            icon={LuPlus}
            onClick={() => handleOpen('bank-selection')}
        />
    );
};
