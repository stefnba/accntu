'use client';

import { Button } from '@/components/ui/button';
import { storeCreateImportModal } from '@/features/import/store/create-import-modal';
import { LuPlus } from 'react-icons/lu';

/**
 * Main modal trigger for creating a new import.
 */
export const CreateImportModalTrigger = () => {
    const { handleOpen } = storeCreateImportModal();

    return (
        <Button size="sm" onClick={handleOpen}>
            <LuPlus className="mr-2 size-4" />
            Add Import
        </Button>
    );
};
