import { MainContent } from '@/components/layout/main';
import { BucketManager } from '@/features/bucket/components//bucket';

export default async function BucketsPage() {
    return (
        <MainContent
            pageHeader={{
                title: 'Buckets',
                description: 'Manage the buckets you can assign to participants.',
            }}
        >
            <BucketManager />
        </MainContent>
    );
}
