import { PageHeader } from '@/components/page/header';
import { CreateTagSheetTrigger } from '@/features/tag/components/crud/sheet-trigger';
import { ListTags } from '@/features/tag/components/tag-list';

export default async function LabelList() {
    return (
        <div>
            <PageHeader title="Tags" actionBar={<CreateTagSheetTrigger />} />
            <ListTags />
        </div>
    );
}
