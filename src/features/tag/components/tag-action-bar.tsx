'use client';

import { Button } from '@/components/ui/button';
import { useTagUpsertModal } from '@/features/tag/hooks';
import { Plus } from 'lucide-react';

export const TagActionBar = () => {
    const { openModal } = useTagUpsertModal();
    return (
        <div>
            <Button onClick={() => openModal({ mode: 'create' })}>
                <Plus className="w-4 h-4 mr-2" />
                New Tag
            </Button>
        </div>
    );
};
