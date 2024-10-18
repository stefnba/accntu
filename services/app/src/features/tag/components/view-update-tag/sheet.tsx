'use client';

import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader
} from '@/components/ui/sheet';
import { useGetTag } from '@/features/tag/api/get-tag';
import { storeViewUpdateTagSheet } from '@/features/tag/store/view-update-label-sheet';

export const ViewUpdateTagSheet = () => {
    const { isOpen, handleClose, id, view, setView } =
        storeViewUpdateTagSheet();

    const { data: tag, isLoading } = useGetTag({ id });

    if (!tag || !id) return;

    return (
        <Sheet open={isOpen} onOpenChange={handleClose}>
            <SheetContent>
                <SheetHeader>{tag.name}</SheetHeader>
            </SheetContent>
        </Sheet>
    );
};
