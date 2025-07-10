'use client';

import { Button } from '@/components/ui/button';
import { DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ResponsiveModal } from '@/components/ui/responsive-modal';
import { Edit2, Eye, Plus, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLabelEndpoints } from '../api';
import { useLabelModal } from '../hooks';
import { LabelForm } from './label-form';
import {
    LabelTree,
    LabelTreeChildren,
    LabelTreeItem,
    LabelTreeItemAction,
    LabelTreeItemActions,
    LabelTreeItemBadge,
    LabelTreeItemButton,
    LabelTreeItemContent,
} from './label-tree';

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
    const { modalOpen, modalType, labelId, parentId, closeModal, openCreateModal, openEditModal } =
        useLabelModal();
    const router = useRouter();
    const deleteMutation = useLabelEndpoints.delete();

    // Action handlers - labelId comes from context via LabelTreeItemAction
    const handleView = (labelId: string) => {
        router.push(`/labels/${labelId}`);
    };

    const handleEdit = (labelId: string) => {
        openEditModal(labelId);
    };

    const handleAddChild = (labelId: string) => {
        openCreateModal(labelId);
    };

    const handleDelete = async (labelId: string) => {
        if (confirm('Are you sure you want to delete this label?')) {
            await deleteMutation.mutateAsync({ param: { id: labelId } });
        }
    };

    /*
     * Reusable label item template
     */
    const LabelItemTemplate = () => (
        <LabelTreeItem>
            <LabelTreeItemContent>
                {/* Button to expand/collapse the label */}
                <LabelTreeItemButton />

                {/* Badge with name and icon */}
                <LabelTreeItemBadge />

                {/* Actions */}
                <LabelTreeItemActions>
                    {/* View label */}
                    <LabelTreeItemAction onClick={handleView} tooltip="View label">
                        <Eye className="w-3 h-3" />
                    </LabelTreeItemAction>

                    {/* Add child label */}
                    <LabelTreeItemAction onClick={handleAddChild} tooltip="Add child label">
                        <Plus className="w-3 h-3" />
                    </LabelTreeItemAction>

                    {/* Edit label */}
                    <LabelTreeItemAction onClick={handleEdit} tooltip="Edit label">
                        <Edit2 className="w-3 h-3" />
                    </LabelTreeItemAction>

                    {/* Delete label */}
                    <LabelTreeItemAction
                        onClick={handleDelete}
                        tooltip="Delete label"
                        className="text-red-600"
                    >
                        <Trash2 className="w-3 h-3" />
                    </LabelTreeItemAction>
                </LabelTreeItemActions>
            </LabelTreeItemContent>

            {/* Recursive rendering: LabelTreeChildren will map over children and render this template for each */}
            <LabelTreeChildren>
                <LabelItemTemplate />
            </LabelTreeChildren>
        </LabelTreeItem>
    );

    return (
        <div className="space-y-4">
            <LabelTree className="border rounded-lg p-4">
                <LabelItemTemplate />
            </LabelTree>

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
