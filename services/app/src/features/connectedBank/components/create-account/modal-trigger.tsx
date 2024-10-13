'use client';

import { Button } from '@/components/ui/button';
import { storeBankAccountCreate } from '@/features/connectedBank/store/account-create-modal';
import { LuPlus } from 'react-icons/lu';

export const CreateConnectedBankTrigger = () => {
    const { handleOpen } = storeBankAccountCreate();

    return (
        <Button size="sm" onClick={handleOpen}>
            <LuPlus className="mr-2 size-4" />
            Add Bank Account
        </Button>
    );
};
