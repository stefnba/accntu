import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TBucket } from '@/features/bucket/schemas';

export type BucketCardProps = {
    bucket: TBucket;
};

export const BucketCard: React.FC<BucketCardProps> = ({ bucket }) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{bucket.title}</CardTitle>
            </CardHeader>
        </Card>
    );
};

export const BucketCardSkeleton = () => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>
                    <Skeleton className="w-full h-4" />
                </CardTitle>
            </CardHeader>
        </Card>
    );
};
