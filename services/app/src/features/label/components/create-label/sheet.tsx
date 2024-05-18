'use client';

import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader
} from '@/components/ui/sheet';
import { storeCreateLabelSheet } from '@/features/label/store/create-label-sheet';

import { CreateLabelForm } from './create-label-form';

export const CreateLabelSheet = () => {
    const { isOpen, handleClose } = storeCreateLabelSheet();

    return (
        <Sheet open={isOpen} onOpenChange={handleClose}>
            <SheetContent>
                <SheetHeader>Add a new Label</SheetHeader>
                <SheetDescription>You can create a new Label.</SheetDescription>
                <CreateLabelForm />
            </SheetContent>
        </Sheet>
    );
};
