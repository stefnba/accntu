'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { useLabelModal } from '../hooks';
import { LabelForm } from './label-form';
import { LabelTree } from './label-tree';

export const LabelManager = () => {
    const { modalOpen, modalType, labelId, parentId, openCreateModal, closeModal } =
        useLabelModal();

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Labels</h3>
                <Button size="sm" onClick={() => openCreateModal()}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Label
                </Button>
            </div>

            <LabelTree className="border rounded-lg p-4" />

            <Dialog open={modalOpen} onOpenChange={closeModal}>
                <DialogContent>
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
                </DialogContent>
            </Dialog>
        </div>
    );
};
