'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { useLabelEndpoints } from '../api';
import { useLabelModal } from '../hooks';
import { LabelForm } from './label-form';
import { LabelTree } from './label-tree';

export const LabelManager = () => {
    const { data: labels, isLoading } = useLabelEndpoints.getRoots({});
    const { modalOpen, modalType, labelId, parentId, openCreateModal, openEditModal, closeModal } =
        useLabelModal();

    const handleEdit = (editLabelId: string) => {
        openEditModal(editLabelId);
    };

    const handleAddChild = (parentLabelId: string) => {
        openCreateModal(parentLabelId);
    };

    if (isLoading) {
        return <div className="p-4">Loading labels...</div>;
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Labels</h3>
                <Button size="sm" onClick={() => openCreateModal()}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Label
                </Button>
            </div>

            <LabelTree
                labels={labels || []}
                onEdit={handleEdit}
                onAddChild={handleAddChild}
                className="border rounded-lg p-4"
            />

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
