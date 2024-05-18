import { PageHeader } from '@/components/page/header';
import { CreateLabelSheetTrigger } from '@/features/label/components/create-label/sheet-trigger';
import { ListLabels } from '@/features/label/components/list-labels';

export default async function LabelList() {
    return (
        <div>
            <PageHeader
                title="Labels"
                actionBar={<CreateLabelSheetTrigger />}
            />

            <ListLabels />
        </div>
    );
}
