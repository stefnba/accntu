'use client';

import { useParticipantEndpoints } from '@/features/participant/api';
import { Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { ParticipantUpsertForm } from '@/features/participant/components/participant-form';
import { useCreateUpdateParticipantModal } from '@/features/participant/hooks';
import toast from 'react-hot-toast';

export function ParticipantManager() {
    const { setModal } = useCreateUpdateParticipantModal();
    const { data: participants } = useParticipantEndpoints.getAll({ query: {} });
    const { mutate: deleteParticipant } = useParticipantEndpoints.delete();

    const handleDelete = (id: string) => {
        deleteParticipant(
            { param: { id } },
            {
                onSuccess() {
                    toast.success('Participant deleted successfully');
                },
                onError() {
                    toast.error('Failed to delete participant');
                },
            }
        );
    };

    return (
        <Card>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {participants?.map((p) => (
                        <TableRow key={p.id}>
                            <TableCell>{p.name}</TableCell>
                            <TableCell>{p.email}</TableCell>
                            <TableCell className="text-right">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDelete(p.id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <ParticipantUpsertForm />
        </Card>
    );
}
