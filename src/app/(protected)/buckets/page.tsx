import { BucketManager } from '@/features/bucket/components/bucket-manager';

export default async function BucketsPage() {
    return (
        <div className="container mx-auto p-4">
            <BucketManager />
        </div>
    );
}
