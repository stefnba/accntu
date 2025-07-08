'use client';

import { Button } from '@/components/ui/button';
import { DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ResponsiveModal } from '@/components/ui/responsive-modal';
import { Plus } from 'lucide-react';
import { useLabelModal } from '../hooks';
import { LabelForm } from './label-form';
import { LabelTree } from './label-tree';

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
        <div className="space-y-4">
            <LabelTree className="border rounded-lg p-4" />

            <ResponsiveModal open={modalOpen} onOpenChange={closeModal}>
                <DialogHeader>
                    <DialogTitle>
                        {modalType === 'create' ? 'Create New Label' : 'Edit Label'}
                    </DialogTitle>
                </DialogHeader>
                <LabelForm
                    labelId={modalType === 'edit' ? labelId : null}
                    parentId={parentId}
                    onSuccess={closeModal}
                />
            </ResponsiveModal>
        </div>
    );
};
