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

export default async function LabelList() {
    const user = await getUser();

    const labels = await db.label.findMany({
        where: {
            userId: user.id
        }
    });

    const accountRender = labels.map((label) => {
        return (
            <Card className="border border-primary" key={label.id}>
                <CardHeader>
                    <CardTitle>{label.name}</CardTitle>
                </CardHeader>
                <CardContent></CardContent>
            </Card>
        );
    });

    return (
        <div>
            <PageHeader title="Settings" />
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {accountRender}
            </div>
        </div>
    );
}
