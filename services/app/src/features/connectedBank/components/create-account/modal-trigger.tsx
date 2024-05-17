'use client';

import { Button } from '@/components/ui/button';
import { storeCreateConnectedBankModal } from '@/features/connectedBank/store/create-bank-modal';
import { LuPlus } from 'react-icons/lu';

export const CreateConnectedBankTrigger = () => {
    const { handleOpen } = storeCreateConnectedBankModal();

    return (
        <Button size="sm" onClick={handleOpen}>
            <LuPlus className="mr-2 size-4" />
            Add Bank Account
        </Button>
    );
};
