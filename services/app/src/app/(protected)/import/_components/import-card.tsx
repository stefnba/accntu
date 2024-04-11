import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from '@/components/ui/card';
import { Import } from '@prisma/client';
import dayjs from 'dayjs';

interface Props {
    importRecord: Import;
}

export const ImportCard: React.FC<Props> = ({ importRecord }) => {
    const { successAt, createdAt, id } = importRecord;

    return (
        <Link href={`/import/${id}`}>
            <Card>
                <CardHeader>
                    <CardTitle>
                        {dayjs(createdAt).format('DD-MMM YY HH:mm')}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <CardDescription>
                        {successAt ? (
                            <Badge variant="default">Completed</Badge>
                        ) : (
                            <Badge variant="outline">Draft</Badge>
                        )}

                        {/* 'Completed' : 'Draft'} */}
                    </CardDescription>
                </CardContent>
            </Card>
        </Link>
    );
};
