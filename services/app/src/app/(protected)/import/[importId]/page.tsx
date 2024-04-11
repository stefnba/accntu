import Link from 'next/link';

import { PageHeader } from '@/components/page/header';
import { Button } from '@/components/ui/button';
import db from '@/db';
import dayjs from 'dayjs';

interface Props {
    params: {
        importId: string;
    };
}

export default async function OneImport({ params: { importId } }: Props) {
    const importRecord = await db.import.findUnique({
        where: { id: importId }
    });

    if (!importRecord) {
        return <div>Import not found</div>;
    }

    if (!importRecord.successAt) {
        return (
            <div>
                <PageHeader
                    title={dayjs(importRecord.createdAt).format(
                        'DD-MMM YY HH:mm'
                    )}
                />
                <p>Import is not yet processed.</p>
                <Button className="mt-8" asChild>
                    <Link href={`/import/new/${importId}`}>
                        Complete Import
                    </Link>
                </Button>
            </div>
        );
    }

    return (
        <div>
            <PageHeader title="New Import" />
            <h1>Import {importId}</h1>
        </div>
    );
}
