'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useBucketEndpoints } from '@/features/bucket/api';
import { BucketForm } from '@/features/bucket/components/bucket-form';
import { PlusCircle } from 'lucide-react';
import { useToggle } from 'react-use';

export function BucketManager() {
    const [isFormOpen, toggleForm] = useToggle(false);

    const deleteMutation = useBucketEndpoints.delete();
    const { data: buckets } = useBucketEndpoints.getAll({});

    const handleDelete = (id: string) => {
        deleteMutation.mutate({ param: { id } });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Buckets</CardTitle>
                <div className="flex items-center gap-2">
                    <Button onClick={toggleForm} size="sm">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Bucket
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {/* <DataTable
                    columns={columns({ onDelete: handleDelete })}
                    data={buckets || []}
                    filterKey="title"
                /> */}
            </CardContent>
            <BucketForm isOpen={isFormOpen} onClose={toggleForm} />
        </Card>
    );
}
