'use client';

import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle
} from '@/components/ui/sheet';
import { useDeleteImport } from '@/features/import/api/delete-import';
import { useGetImport } from '@/features/import/api/get-import';
import { storeCreateImportModal } from '@/features/import/store/create-import-modal';
import { storeViewImportSheet } from '@/features/import/store/view-import-sheet';
import { LuPencil, LuTrash } from 'react-icons/lu';

import { FileCard } from '../file-card';

// import { UpdateLabelForm } from './update-label-form';

export const ViewImportSheet = () => {
    const { isOpen, handleClose, id } = storeViewImportSheet();
    const { handleContinue } = storeCreateImportModal();

    const { data: importRecord, isLoading } = useGetImport({ id });
    const { mutate: deleteImport } = useDeleteImport();

    if (isLoading) return <div>Loading...</div>;

    if (!importRecord) return <div>Import not found</div>;

    const { files } = importRecord;

    const handleComplete = () => {
        handleClose();
        handleContinue(importRecord.id);
    };

    return (
        <Sheet open={isOpen} onOpenChange={handleClose}>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>{importRecord.createdAt}</SheetTitle>
                    {/* <SheetDescription>ddd</SheetDescription> */}
                </SheetHeader>

                {/* Files */}
                <div className="text-muted-foreground mt-4">Files</div>
                <div className="mb-4 space-y-2">
                    {files.map((file) => (
                        <FileCard
                            key={file.id}
                            name={file.filename}
                            type={file.type}
                        />
                    ))}
                </div>

                <div className="mt-10">
                    <Button
                        size="sm"
                        variant="outline"
                        className="w-full mt-2"
                        onClick={handleComplete}
                    >
                        <LuPencil className="size-4 mr-2" />
                        Complete
                    </Button>

                    <Button
                        size="sm"
                        variant="destructive"
                        className="w-full mt-2"
                        onClick={() => deleteImport({ id })}
                    >
                        <LuTrash className="size-4 mr-2" />
                        Delete
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
};
