import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TBucketService } from '@/features/bucket/schemas';

export type BucketCardProps = {
    bucket: TBucketService['select'];
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
