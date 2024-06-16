'use client';

import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader
} from '@/components/ui/sheet';
import { useDeleteLabel } from '@/features/label/api/delete-label';
import { useGetLabel } from '@/features/label/api/get-label';
import { LabelIcon } from '@/features/label/components/label-icon';
import { storeViewUpdateLabelSheet } from '@/features/label/store/view-update-label-sheet';
import { BiLabel } from 'react-icons/bi';
import { LuPencil, LuTrash } from 'react-icons/lu';

import { UpdateLabelForm } from './update-label-form';

export const ViewUpdateLabelSheet = () => {
    const { isOpen, handleClose, id, view, setView } =
        storeViewUpdateLabelSheet();
    const { mutate: deleteLabel } = useDeleteLabel();

    const { data: label, isLoading } = useGetLabel({ id });

    if (!label) return;

    return (
        <Sheet open={isOpen} onOpenChange={handleClose}>
            <SheetContent>
                {view === 'update' && (
                    <>
                        <SheetHeader>Update {label?.name}</SheetHeader>
                        <SheetDescription>
                            You can create a new Label.
                        </SheetDescription>
                        <UpdateLabelForm label={label} />
                        <Button
                            size="sm"
                            variant="outline"
                            className="w-full mt-2"
                            onClick={() => setView('view')}
                        >
                            {/* <LuTrash className="size-4 mr-2" /> */}
                            Cancel
                        </Button>
                    </>
                )}
                {view === 'view' && (
                    <>
                        <div className="flex align-middle items-center mb-4">
                            <LabelIcon color={label?.color} />
                            <span className="text-2xl font-semibold">
                                {label?.name}
                            </span>
                        </div>
                        {label.description && (
                            <div className="mt-6">
                                <div className="text-sm text-muted-foreground">
                                    Description
                                </div>
                                <div className=" mt-1">{label.description}</div>
                            </div>
                        )}

                        {label?.parentLabel && (
                            <div className="mt-6">
                                <div className="text-sm text-muted-foreground">
                                    Parent Label
                                </div>
                                <div
                                    style={{
                                        background: label?.color || '',
                                        color: !label?.color
                                            ? 'var(--primary)'
                                            : ''
                                    }}
                                    className="text-large font-semibold border rounded-md p-2 mt-1 text-white"
                                >
                                    {label?.parentLabel?.name ||
                                        'No Parent Label'}
                                </div>
                            </div>
                        )}
                        {label?.childLabels &&
                            label?.childLabels.length > 0 && (
                                <div className="mt-6">
                                    <div className="text-sm text-muted-foreground">
                                        Child Labels
                                    </div>
                                    {label?.childLabels?.map((childLabel) => (
                                        <div
                                            key={childLabel.id}
                                            style={{
                                                borderColor: label?.color || '',
                                                color: label?.color || ''
                                            }}
                                            className="text-large font-semibold border rounded-md p-2 mt-1 border-primary text-primary"
                                        >
                                            {childLabel.name}
                                        </div>
                                    ))}
                                </div>
                            )}
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
                                onClick={() => deleteLabel({ id })}
                            >
                                <LuTrash className="size-4 mr-2" />
                                Delete
                            </Button>
                        </div>
                    </>
                )}
            </SheetContent>
        </Sheet>
    );
};
