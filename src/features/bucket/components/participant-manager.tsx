'use client';

import { DataTable } from '@/components/data-table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useBucketParticipantEndpoints } from '@/features/bucket/api';
import { useQueryClient } from '@tanstack/react-query';
import { PlusCircle } from 'lucide-react';
import { useToggle } from 'react-use';
import { columns } from './participant-columns';
import { ParticipantForm } from './participant-form';

interface ParticipantManagerProps {
    bucketId: string;
}

export function ParticipantManager({ bucketId }: ParticipantManagerProps) {
    const queryClient = useQueryClient();
    const [isFormOpen, toggleForm] = useToggle(false);

    const { data: participants } = useBucketParticipantEndpoints.getAllForBucket({
        param: { bucketId },
    });

    const deleteMutation = useBucketParticipantEndpoints.delete();

    const handleDelete = (id: string) => {
        deleteMutation.mutate(id);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Participants</CardTitle>
                <div className="flex items-center gap-2">
                    <Button onClick={toggleForm} size="sm">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Participant
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <DataTable columns={columns({ onDelete: handleDelete })} filterKey="name" />
            </CardContent>
            <ParticipantForm isOpen={isFormOpen} onClose={toggleForm} bucketId={bucketId} />
        </Card>
    );
}
