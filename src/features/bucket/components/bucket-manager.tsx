'use client';

import { useBucketEndpoints } from '@/features/bucket/api';
import { BucketCard } from '@/features/bucket/components/bucket-card';
import { BucketCreateUpdateModal } from '@/features/bucket/components/bucket-create-update-modal';

export function BucketManager() {
    const { data: buckets } = useBucketEndpoints.getAll({});

    return (
        <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {buckets?.map((bucket) => <BucketCard key={bucket.id} bucket={bucket} />)}
            </div>

            <BucketCreateUpdateModal />
        </div>
    );
}
