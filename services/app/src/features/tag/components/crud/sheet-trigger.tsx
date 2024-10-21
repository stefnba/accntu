'use client';

import { Button } from '@/components/ui/button';
import { storeViewUpdateTagSheet } from '@/features/tag/store/crud-tag-sheet';
import { LuPlus } from 'react-icons/lu';

export const CreateTagSheetTrigger = () => {
    const { handleOpen } = storeViewUpdateTagSheet();

    return (
        <Button size="sm" onClick={() => handleOpen({ view: 'create' })}>
            <LuPlus className="mr-2 size-4" />
            Add Tag
        </Button>
    );
};
