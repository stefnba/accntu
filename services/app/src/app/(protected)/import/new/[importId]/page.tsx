import Transaction from '@/app/(protected)/transaction/page';
import { PageHeader } from '@/components/page/header';
import db from '@/db';
import dayjs from 'dayjs';

import { ParsedFileSelection } from './_components/parsed-file-selection';
import { TransactionSelection } from './_components/transaction-selection';

interface Props {
    params: {
        importId: string;
    };
}

export default async function Page({ params: { importId } }: Props) {
    const importRecord = await db.import.findUnique({
        where: { id: importId },
        include: {
            files: true
        }
    });

    if (!importRecord) {
        return <div>Import not found</div>;
    }

    if (importRecord.successAt) {
        return <div>Import already completed</div>;
    }

    const files = importRecord.files;

    return (
        <>
            <PageHeader
                title={dayjs(importRecord.createdAt).format('DD-MMM YY HH:mm')}
            />
            {files.length > 1 && <ParsedFileSelection files={files} />}

            <TransactionSelection
                userId={importRecord.userId}
                accountId={importRecord.accountId}
                importId={importId}
                files={files.map((file) => ({
                    id: file.id,
                    url: file.url,
                    filename: file.filename
                }))}
            />
        </>
    );
}
