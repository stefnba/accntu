import { PageHeader } from '@/components/page/header';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from '@/components/ui/card';
import db from '@/db';
import { getUser } from '@/lib/auth';

interface Props {
    params: {
        labelId: string;
    };
}

export default async function OneAccount({ params }: Props) {
    const user = await getUser();
    const { labelId } = params;

    const account = await db.label.findUnique({
        where: {
            id: labelId,
            userId: user.id
        }
    });

    return (
        <div>
            <PageHeader title="Settings" />
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {account?.name}
            </div>
        </div>
    );
}
