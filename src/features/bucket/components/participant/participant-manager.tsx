'use client';

import { useBucketParticipantEndpoints } from '@/features/bucket/api/participant';
import { PlusCircle, Trash2 } from 'lucide-react';

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
import { ParticipantForm } from '@/features/bucket/components/participant/participant-form';
import { useCreateUpdateParticipantModal } from '@/features/bucket/hooks/participant';

interface ParticipantManagerProps {
    bucketId?: string;
}

export function ParticipantManager({ bucketId }: ParticipantManagerProps) {
    const { setModal } = useCreateUpdateParticipantModal();
    const { data: participants } = useBucketParticipantEndpoints.getAll({});

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>
                        {bucketId ? 'Bucket Participants' : 'Global Participants'}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                        <Button onClick={() => setModal(true)} size="sm">
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
                            {participants?.map((p) => (
                                <TableRow key={p.id}>
                                    <TableCell>{p.name}</TableCell>
                                    <TableCell>{p.email}</TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            // onClick={() => handleDelete(p.id)}
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
            <ParticipantForm />
        </>
    );
}
