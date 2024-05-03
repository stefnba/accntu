import { labelActions } from '@/actions';
import { PageHeader } from '@/components/page/header';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from '@/components/ui/card';

import { LabelCard } from '../_components/label-card';
import { NewLabelCard } from '../_components/new-label-card';

interface Props {
    params: {
        labelId: string;
    };
}

export default async function OneAccount({ params: { labelId } }: Props) {
    const { data: label } = await labelActions.findById({ id: labelId });
    const childLabels = await labelActions.list({
        parentId: label?.id
    });

    return (
        <div>
            <PageHeader title={label?.name || ''} />

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <NewLabelCard />
                {childLabels?.map((childLabel) => (
                    <LabelCard key={childLabel.id} label={childLabel} />
                ))}
            </div>
        </div>
    );
}
