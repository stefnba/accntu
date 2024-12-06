'use client';

import { HeaderActionButton } from '@/components/page/header';
import { storeViewUpdateTagSheet } from '@/features/tag/store/crud-tag-sheet';
import { LuPlus } from 'react-icons/lu';

export const CreateTagSheetTrigger = () => {
    const { handleOpen } = storeViewUpdateTagSheet();

    return (
        <HeaderActionButton
            label="Add Tag"
            icon={LuPlus}
            onClick={() => handleOpen({ view: 'create' })}
        />
    );
};
