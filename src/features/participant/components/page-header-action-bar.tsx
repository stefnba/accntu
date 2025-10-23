'use client';

import { Button } from '@/components/ui/button';
import { useUpsertParticipantModal } from '@/features/participant/hooks';
import { PlusCircle } from 'lucide-react';

export const ParticipantPageHeaderActionBar = () => {
    const { modal } = useUpsertParticipantModal();

    return (
        <div className="flex items-center gap-2">
            <Button onClick={() => modal.open('create')} size="sm">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Participant
            </Button>
        </div>
    );
};
