'use client';

import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader
} from '@/components/ui/sheet';
import { useGetTag } from '@/features/tag/api/get-tag';
import { storeViewUpdateTagSheet } from '@/features/tag/store/crud-tag-sheet';
import { LuPencil, LuTrash } from 'react-icons/lu';

import { useDeleteTag } from '../../api/delete-tag';
import { CreateUpdateTagForm } from './create-update-tag-form';

export const TagCrudSheet = () => {
    const { isOpen, handleClose, id, view, setView } =
        storeViewUpdateTagSheet();

    const { data: tag, isLoading } = useGetTag({ id });
    const { mutate: deleteTagMutate } = useDeleteTag();

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <Sheet open={isOpen} onOpenChange={handleClose}>
            <SheetContent>
                {view === 'update' && (
                    <div>
                        <SheetHeader>{tag?.name}</SheetHeader>
                        <CreateUpdateTagForm tag={tag} />
                    </div>
                )}
                {view === 'create' && (
                    <div>
                        <SheetHeader>New Tag</SheetHeader>
                        <SheetDescription>Create a new Tag</SheetDescription>
                        <CreateUpdateTagForm />
                    </div>
                )}
                {view === 'view' && tag?.id && (
                    <div>
                        <SheetHeader>{tag?.name}</SheetHeader>

                        <div className="mt-10">
                            <Button
                                size="sm"
                                variant="outline"
                                className="w-full mt-2"
                                onClick={() => setView('update')}
                            >
                                <LuPencil className="size-4 mr-2" />
                                Update
                            </Button>
                            <Button
                                size="sm"
                                variant="destructive"
                                className="w-full mt-2"
                                onClick={() => deleteTagMutate({ id: tag?.id })}
                            >
                                <LuTrash className="size-4 mr-2" />
                                Delete
                            </Button>
                        </div>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
};
