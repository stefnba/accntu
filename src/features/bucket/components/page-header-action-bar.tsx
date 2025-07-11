'use client';

import { Button } from '@/components/ui/button';
import { useCreateUpdateBucketModal } from '@/features/bucket/hooks';
import { PlusCircle } from 'lucide-react';

export const BucketPageHeaderActionBar = () => {
    const { setModal } = useCreateUpdateBucketModal();

    return (
        <div className="flex items-center gap-2">
            <Button onClick={() => setModal(true)} size="sm">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Bucket
            </Button>
        </div>
    );
};
