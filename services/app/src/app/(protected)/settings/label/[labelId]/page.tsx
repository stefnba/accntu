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

interface Props {
    params: {
        labelId: string;
    };
}

export default async function OneAccount({ params: { labelId } }: Props) {
    const { data: label } = await labelActions.findById({ id: labelId });

    return (
        <div>
            <PageHeader title="Settings" />
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {label?.name}
            </div>
        </div>
    );
}
