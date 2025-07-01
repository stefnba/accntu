'use client';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { useLabelEndpoints } from '../api';
import type { TLabelQuery } from '../schemas';
import { LabelEditForm } from './label-edit-form';
import { LabelForm } from './label-form';
import { LabelTree } from './label-tree';

export const LabelManager = () => {
    const { data: labels, isLoading } = useLabelEndpoints.getAll({});
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [selectedLabel, setSelectedLabel] = useState<TLabelQuery['select'] | null>(null);
    const [parentId, setParentId] = useState<string | undefined>();

    const handleEdit = (label: TLabelQuery['select']) => {
        setSelectedLabel(label);
        setEditDialogOpen(true);
    };

    const handleAddChild = (parentLabelId: string) => {
        setParentId(parentLabelId);
        setCreateDialogOpen(true);
    };

    const handleCreateSuccess = () => {
        setCreateDialogOpen(false);
        setParentId(undefined);
    };

    const handleEditSuccess = () => {
        setEditDialogOpen(false);
        setSelectedLabel(null);
    };

    if (isLoading) {
        return <div className="p-4">Loading labels...</div>;
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Labels</h3>
                <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Label
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create New Label</DialogTitle>
                        </DialogHeader>
                        <LabelForm onSuccess={handleCreateSuccess} />
                    </DialogContent>
                </Dialog>
            </div>

            <LabelTree
                labels={labels || []}
                onEdit={handleEdit}
                onAddChild={handleAddChild}
                className="border rounded-lg p-4"
            />

            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Label</DialogTitle>
                    </DialogHeader>
                    {selectedLabel && (
                        <LabelEditForm label={selectedLabel} onSuccess={handleEditSuccess} />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};
