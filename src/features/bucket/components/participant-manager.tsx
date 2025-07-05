'use client';

import { useParticipantEndpoints } from '@/features/bucket/hooks/bucketParticipant';
import { PlusCircle, Trash2 } from 'lucide-react';
import { useToggle } from 'react-use';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { ParticipantForm } from './bucketParticipant-form';

interface ParticipantManagerProps {
    bucketId?: string;
}

export function ParticipantManager({ bucketId }: ParticipantManagerProps) {
    const [isFormOpen, toggleForm] = useToggle(false);
    const getAllParticipants = useParticipantEndpoints.getAll;
    const { data: participants } = getAllParticipants({});
    const { mutate: deleteParticipant } = useParticipantEndpoints.delete();

    const handleDelete = (id: string) => {
        const confirmed = window.confirm('Are you sure you want to delete this bucketParticipant?');
        if (confirmed) {
            deleteParticipant({ param: { id } });
        }
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>
                        {bucketId ? 'Bucket Participants' : 'Global Participants'}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                        <Button onClick={toggleForm} size="sm">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add Participant
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {participants?.data?.map((p) => (
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
                </CardContent>
            </Card>
            <ParticipantForm isOpen={isFormOpen} onClose={toggleForm} />
        </>
    );
}
