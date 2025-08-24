'use client';

import { Button } from '@/components/ui/button';
import { useAddBankModal } from '@/features/bank/hooks';
import { Plus } from 'lucide-react';

export const AddBankButton = () => {
    const { openModal } = useAddBankModal();
    return (
        <Button variant="default" className="flex items-center gap-2" onClick={() => openModal()}>
            <Plus className="size-4" />
            Add Bank
        </Button>
    );
};
