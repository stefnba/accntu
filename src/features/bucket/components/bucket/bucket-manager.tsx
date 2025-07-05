'use client';

import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { useBucketEndpoints } from '@/features/bucket/api/bucket';
import { BucketCreateUpdateModal } from '@/features/bucket/components/bucket/bucket-create-update-modal';
import { useCreateUpdateBucketModal } from '@/features/bucket/hooks/bucket';
import { PlusCircle } from 'lucide-react';

export function BucketManager() {
    const { setModal } = useCreateUpdateBucketModal();

    const { data: buckets } = useBucketEndpoints.getAll({});

    return (
        <Card>
            <CardHeader>
                <CardTitle>Buckets</CardTitle>
                <div className="flex items-center gap-2">
                    <Button onClick={() => setModal(true)} size="sm">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Bucket
                    </Button>
                </div>
            </CardHeader>
            <div>{buckets?.map((bucket) => <div key={bucket.id}>{bucket.title}</div>)}</div>
            <BucketCreateUpdateModal />
        </Card>
    );
}
