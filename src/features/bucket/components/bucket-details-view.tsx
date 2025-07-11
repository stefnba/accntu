'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useBucketEndpoints } from '@/features/bucket/api';

interface BucketDetailsViewProps {
    bucketId: string;
}

export function BucketDetailsView({ bucketId }: BucketDetailsViewProps) {
    const { data: bucket } = useBucketEndpoints.getById({ param: { id: bucketId } });

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
                <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-muted-foreground">Total Transactions</p>
                            <p className="text-2xl font-bold">{bucket.totalTransactions}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Total Amount</p>
                            <p className="text-2xl font-bold">{bucket.totalAmount}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Participants</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>Participants for this bucket are managed in the participants section.</p>
                </CardContent>
            </Card>

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
