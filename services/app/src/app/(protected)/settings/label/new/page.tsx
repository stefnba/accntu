import { PageHeader } from '@/components/page/header';

import { NewLabelForm } from './_components/new-label-form';

export default async function AddLabelPage() {
    return (
        <div>
            <PageHeader title="Create a Label" />

            <NewLabelForm />
        </div>
    );
}
