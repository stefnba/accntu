'use client';

import { HeaderActionButton } from '@/components/page/header';
import { LuPlus } from 'react-icons/lu';

import { storeCreateLabelSheet } from '../../store/create-label-sheet';

export const CreateLabelSheetTrigger = () => {
    const { handleOpen } = storeCreateLabelSheet();

    return (
        <HeaderActionButton
            label="Add Label"
            icon={LuPlus}
            onClick={handleOpen}
        />
    );
};
