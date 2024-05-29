import { PageHeader } from '@/components/page/header';
import { CreateImportModalTrigger } from '@/features/import/components/create-import/modal-trigger';

export default async function Import() {
    return (
        <div>
            <PageHeader
                title="Imports"
                actionBar={<CreateImportModalTrigger />}
            />
        </div>
    );
}
