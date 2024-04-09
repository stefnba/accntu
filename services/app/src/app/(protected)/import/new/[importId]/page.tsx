import Transaction from '@/app/(protected)/transaction/page';
import db from '@/db';

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
            {files.map((f) => (
                <p key={f.id}>
                    {f.id} {f.filename} {f.url}
                </p>
            ))}
            <TransactionSelection
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
