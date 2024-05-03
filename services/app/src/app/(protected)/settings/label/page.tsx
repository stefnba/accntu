import { labelActions } from '@/actions';
import { PageHeader } from '@/components/page/header';

import { LabelCard } from './_components/label-card';
import { NewLabelCard } from './_components/new-label-card';

export default async function LabelList() {
    const labels = await labelActions.list({});

    return (
        <div>
            <PageHeader title="Labels" />
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <NewLabelCard />
                {labels?.map((label) => (
                    <LabelCard key={label.id} label={label} />
                ))}
            </div>
        </div>
    );
}
