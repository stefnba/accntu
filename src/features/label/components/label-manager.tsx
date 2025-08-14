'use client';

import { Button } from '@/components/ui/button';
import { LabelUpsertModal } from '@/features/label/components/label-upsert';
import { LabelSortableTree } from '@/features/label/components/sortable-tree';
import { useLabelUpsertModal } from '@/features/label/hooks';

import { Plus } from 'lucide-react';

export const LabelManagerActionBar = () => {
    const { openModal } = useLabelUpsertModal();
    return (
        <div className="flex items-center justify-end">
            <Button size="sm" onClick={() => openModal({ view: 'create' })}>
                <Plus className="w-4 h-4 mr-2" />
                Add Label
            </Button>
        </div>
    );
};

export const LabelManager = () => {
    return (
        <div className="space-y-8 my-8">
            <LabelSortableTree />
            <LabelUpsertModal />
        </div>
    );
};
