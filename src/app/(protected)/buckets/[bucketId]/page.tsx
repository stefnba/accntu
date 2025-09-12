import { BucketDetailsView } from '@/features/bucket/components/bucket-details-view';

export default async function BucketDetailsPage({
    params,
}: {
    params: Promise<{ bucketId: string }>;
}) {
    const { bucketId } = await params;

    return (
        <div className="container mx-auto p-4">
            <BucketDetailsView bucketId={bucketId} />
        </div>
    );
}
