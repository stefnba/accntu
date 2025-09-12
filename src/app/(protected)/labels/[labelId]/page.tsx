import { MainContent } from '@/components/layout/main';
import { LabelDetailsViewManager } from '@/features/label/components/label-details-view/labels-details-manager';

export default async function LabelDetailsPage({
    params,
}: {
    params: Promise<{ labelId: string }>;
}) {
    const { labelId } = await params;
    return (
        <MainContent
            backButton
            pageHeader={{ title: 'Label Details', description: 'View and manage label details' }}
        >
            <LabelDetailsViewManager labelId={labelId} />
        </MainContent>
    );
}
