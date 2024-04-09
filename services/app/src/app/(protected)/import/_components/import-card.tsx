import Link from 'next/link';

import { Card, CardHeader } from '@/components/ui/card';
import { Import } from '@prisma/client';

interface Props {
    importRecord: Import;
}

export const ImportCard: React.FC<Props> = ({ importRecord }) => {
    return (
        <Link href={`/import/${importRecord.id}`}>
            <Card>
                <CardHeader>{importRecord.id}</CardHeader>
            </Card>
        </Link>
    );
};
