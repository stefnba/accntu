'use client';

import { Button } from '@/components/ui/button';
import { DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ResponsiveModal } from '@/components/ui/responsive-modal';
import { LabelForm } from '@/features/label/components/label-form';
import { LabelSortableTree } from '@/features/label/components/sortable-tree';
import { useLabelModal } from '@/features/label/hooks';
import { Plus } from 'lucide-react';

export const LabelManagerActionBar = () => {
    const { openCreateModal } = useLabelModal();
    return (
        <div className="flex items-center justify-end">
            <Button size="sm" onClick={() => openCreateModal()}>
                <Plus className="w-4 h-4 mr-2" />
                Add Label
            </Button>
        </div>
    );
};

export const LabelManager = () => {
    const { modalOpen, modalType, labelId, parentId, closeModal } = useLabelModal();

    return (
        <div className="space-y-8 my-8">
            <LabelSortableTree />

            <ResponsiveModal open={modalOpen} onOpenChange={closeModal}>
                <DialogHeader>
                    <DialogTitle>
                        {modalType === 'create' ? 'Create New Label' : 'Edit Label'}
                    </DialogTitle>
                </DialogHeader>
                <LabelForm labelId={modalType === 'edit' ? labelId : null} parentId={parentId} />
            </ResponsiveModal>
        </div>
    );
};
