import { PageHeader } from '@/components/page/header';
import { ListTags } from '@/features/tag/components/tag-list';

export default async function LabelList() {
    return (
        <div>
            <PageHeader title="Tags" />

            <ListTags />
        </div>
    );
}
