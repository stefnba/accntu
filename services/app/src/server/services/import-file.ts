import { ParsedTransactionSchema } from '@/features/import/schema/preview-transactions';
import { db } from '@db';
import { z } from 'zod';

type TParserBody = {
    files: Array<{ id: string; url: string }>;
    parser_id: string;
    user_id: string;
};

const ParsedTransactionsSchema = z.array(ParsedTransactionSchema);

export const parseTransactionFile = async (
    fileId: string,
    importId: string,
    userId: string
) => {
    const importRecord = await db.query.transactionImport.findFirst({
        where: (fields, { eq, and }) =>
            and(eq(fields.id, importId), eq(fields.userId, userId))
    });

    if (!importRecord) {
        throw new Error(`Import '${importId}' doesn't exist`);
    }

    const fileRecord = await db.query.transactionImportFile.findFirst({
        where: (fields, { eq, and }) =>
            and(eq(fields.id, fileId), eq(fields.importId, importId))
    });

    if (!fileRecord) {
        throw new Error(`File '${fileId}' doesn't exist`);
    }

    const parserId = 'BARCLAYS_DE_CREDITCARD'; // todo get from importRecord

    const body: TParserBody = {
        files: [
            {
                id: fileId,
                url: fileRecord.url
            }
        ],
        parser_id: parserId,
        user_id: userId
    };

    // todo put into env
    return fetch('http://127.0.0.1:8000/parse/new', {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(async (res) => {
            if (res.ok) {
                const data = await res.json();
                console.log(data[fileId]);

                // zod parse
                const validatedData = ParsedTransactionsSchema.safeParse(
                    data[fileId]
                );

                if (!validatedData.success) {
                    throw new Error(validatedData.error.message);
                }
                console.log(validatedData.data);
                return validatedData.data;
            } else {
                throw new Error(res.statusText);
            }
        })
        .catch((err) => {
            throw err;
        });
};
