'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useBucketEndpoints, useBucketParticipantEndpoints } from '@/features/bucket/api';
import { ParticipantManager } from '@/features/bucket/components/bucketParticipant-manager';

interface BucketDetailsViewProps {
    bucketId: string;
}

export function BucketDetailsView({ bucketId }: BucketDetailsViewProps) {
    const { data: bucket } = useBucketEndpoints.getById({ param: { id: bucketId } });
    const { data: participants } = useBucketParticipantEndpoints.getAllForBucket({
        param: { bucketId },
    });

    if (!bucket) {
        return <div>Bucket not found</div>;
    }

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>{bucket.title}</CardTitle>
                    <p>
                        {bucket.type} - {bucket.status}
                    </p>
                </CardHeader>
            </Card>

            <ParticipantManager bucketId={bucketId}} />

            <Card>
                <CardHeader>
                    <CardTitle>Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                    {/* TODO: Transaction list will be implemented here */}
                    <p>Transactions associated with this bucket will be listed here.</p>
                </CardContent>
            </Card>
        </div>
    );
}
