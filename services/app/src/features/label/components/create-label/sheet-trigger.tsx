'use client';

import { Button } from '@/components/ui/button';
import { LuPlus } from 'react-icons/lu';

import { storeCreateLabelSheet } from '../../store/create-label-sheet';

export const CreateLabelSheetTrigger = () => {
    const { handleOpen } = storeCreateLabelSheet();

    return (
        <Button size="sm" onClick={() => handleOpen()}>
            <LuPlus className="mr-2 size-4" />
            Add Label
        </Button>
    );
};
