import { MainContent } from '@/components/layout/main';
import { BucketManager } from '@/features/bucket/components/';
import { BucketPageHeaderActionBar } from '@/features/bucket/components/page-header-action-bar';

export default async function BucketsPage() {
    return (
        <MainContent
            pageHeader={{
                title: 'Buckets',
                description: 'Manage the buckets you can assign to participants.',
                actionBar: <BucketPageHeaderActionBar />,
            }}
        >
            <BucketManager />
        </MainContent>
    );
}
