'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle
} from '@/components/ui/sheet';
import { useDeleteImport } from '@/features/import/api/delete-import';
import { useGetImport } from '@/features/import/api/get-import';
import { storeCreateImportData } from '@/features/import/store/create-import-data';
import { storeCreateImportModal } from '@/features/import/store/create-import-modal';
import { storeViewImportSheet } from '@/features/import/store/view-import-sheet';
import dayjs from 'dayjs';
import { CircleIcon } from 'lucide-react';
import { LuImport, LuPencil, LuTrash } from 'react-icons/lu';

import { FileCard } from '../file-card';

export const ViewImportSheet = () => {
    const { isOpen, handleClose, id: importId } = storeViewImportSheet();
    const { handleOpen: handleModalOpen, handleStep: handleModalStep } =
        storeCreateImportModal();
    const { setImportId, setImportData } = storeCreateImportData();

    const { data: importRecord, isLoading } = useGetImport({ id: importId });
    const { mutate: deleteImport } = useDeleteImport();

    if (isLoading) return <div>Loading...</div>;

    if (!importRecord) return;

    const { files, account } = importRecord;
    const {
        bank: { bank }
    } = account;

    const handleComplete = () => {
        handleClose();
        handleModalOpen();
        handleModalStep('preview');
        setImportId(importRecord.id);
        setImportData({
            accountId: importRecord.accountId,
            files: []
        });
    };

    if (!importId) {
        return <div>Error</div>;
    }

    return (
        <Sheet open={isOpen} onOpenChange={handleClose}>
            <SheetContent>
                <SheetHeader className="">
                    <SheetTitle>
                        {dayjs(importRecord.createdAt).format(
                            'DD-MMM YY HH:mm'
                        )}
                    </SheetTitle>
                </SheetHeader>

                <div className="mt-6 text-sm">
                    {/* Account */}
                    <div className="grid gap-3">
                        <div className="font-semibold">Account</div>
                        <div className="grid gap-0.5 not-italic text-muted-foreground">
                            <span>
                                {account.name} - {account.bank.bank.name}
                            </span>
                        </div>
                    </div>

                    <Separator className="my-4" />

                    {/* Import details */}

                    <div className="grid gap-3">
                        <div className="font-semibold">Import Details</div>
                        <ul className="grid gap-3">
                            <li className="flex items-center justify-between">
                                <span className="text-muted-foreground">
                                    # Files uploaded
                                </span>
                                {importRecord.fileCount}
                            </li>
                            <li className="flex items-center justify-between">
                                <span className="text-muted-foreground">
                                    # Files imported
                                </span>
                                {importRecord.importedFileCount}
                            </li>
                            <li className="flex items-center justify-between">
                                <span className="text-muted-foreground">
                                    # Transactions imported
                                </span>
                                {importRecord.importedTransactionCount}
                            </li>
                            <li className="flex items-center justify-between">
                                <span className="text-muted-foreground">
                                    Started
                                </span>
                                {dayjs(importRecord.createdAt).format(
                                    'DD-MMM YY HH:mm'
                                )}
                            </li>
                            <li className="flex items-center justify-between">
                                <span className="text-muted-foreground">
                                    Completed
                                </span>
                                {dayjs(importRecord.successAt).format(
                                    'DD-MMM YY HH:mm'
                                )}
                            </li>
                            <li className="flex items-center justify-between">
                                <span className="text-muted-foreground">
                                    Status
                                </span>
                                <div className="flex items-center">
                                    <CircleIcon
                                        style={{
                                            fill: importRecord.successAt
                                                ? '#22c55e'
                                                : '#fbbf24',
                                            color: importRecord.successAt
                                                ? '#22c55e'
                                                : '#fbbf24'
                                        }}
                                        className="mr-1 h-3 w-3"
                                    />
                                    {importRecord.successAt
                                        ? 'Completed'
                                        : 'Pending'}
                                </div>
                            </li>
                        </ul>
                    </div>

                    <Separator className="my-4" />

                    {/* Files */}
                    <div className="font-semibold">Files</div>

                    <div className="my-4 space-y-2">
                        {files.map((file) => (
                            <FileCard
                                key={file.id}
                                name={file.filename}
                                type={file.type}
                                // action={
                                //     <Badge variant="default">
                                //         {file.importedAt!!
                                //             ? 'Imported'
                                //             : 'Not Imported'}
                                //     </Badge>
                                // }
                                description={
                                    <div className="flex space-x-4 text-sm text-muted-foreground">
                                        <div className="flex items-center">
                                            <CircleIcon
                                                style={{
                                                    fill: file.importedAt
                                                        ? '#22c55e'
                                                        : '#fbbf24',
                                                    color: file.importedAt
                                                        ? '#22c55e'
                                                        : '#fbbf24'
                                                }}
                                                className="mr-1 h-3 w-3"
                                            />
                                            {file.importedAt
                                                ? 'Imported'
                                                : 'Pending'}
                                        </div>
                                        {(file.importedTransactionCount || 0) >
                                            0 && (
                                            <div className="flex items-center">
                                                <LuImport className="mr-1 h-3 w-3" />
                                                {file.importedTransactionCount}
                                            </div>
                                        )}
                                        {/* <div>Updated April 2023</div> */}
                                    </div>
                                }
                            />
                        ))}
                    </div>
                </div>

                <div className="mt-10">
                    {!importRecord.successAt && (
                        <Button
                            size="sm"
                            variant="outline"
                            className="w-full mt-2"
                            onClick={handleComplete}
                        >
                            <LuPencil className="size-4 mr-2" />
                            Complete
                        </Button>
                    )}

                    <Button
                        size="sm"
                        variant="destructive"
                        className="w-full mt-2"
                        onClick={() => deleteImport({ id: importId })}
                    >
                        <LuTrash className="size-4 mr-2" />
                        Delete
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
};
