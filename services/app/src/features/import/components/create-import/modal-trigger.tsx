'use client';

import { HeaderActionButton } from '@/components/page/header';
import { storeCreateImportModal } from '@/features/import/store/create-import-modal';
import { LuPlus } from 'react-icons/lu';

/**
 * Main modal trigger for creating a new import.
 */
export const CreateImportModalTrigger = () => {
    const { handleOpen } = storeCreateImportModal();

    return (
        <HeaderActionButton
            label="Add Import"
            icon={LuPlus}
            onClick={handleOpen}
        />
    );
};
