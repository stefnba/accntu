import { db } from '@db';
import {
    InsertTransactionSchema,
    transaction,
    transactionImport,
    transactionImportFile
} from '@db/schema';
import { createId } from '@paralleldrive/cuid2';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';

/**
 * Create new transaction records.
 */
export const createTransactions = async ({
    values,
    importFileId,
    accountId,
    userId
}: {
    values: z.infer<typeof InsertTransactionSchema>[];
    importFileId: string;
    accountId: string;
    userId: string;
}) => {
    // create transaction records
    const newTransactions = await db
        .insert(transaction)
        .values(
            values.map((transaction) => ({
                ...transaction,
                id: createId(),
                accountId,
                userId,
                importFileId
            }))
        )
        .returning()
        .onConflictDoNothing();

    // update import file
    const [importFileRecord] = await db
        .update(transactionImportFile)
        .set({
            importedAt: new Date(),
            transactionCount: values.length,
            importedTransactionCount: newTransactions.length,
            updatedAt: new Date()
        })
        .where(and(eq(transactionImportFile.id, importFileId)))
        .returning();

    if (!importFileRecord) {
        throw new Error('Import file not found');
    }

    const importRecord = await db.query.transactionImport.findFirst({
        where: (fields, { eq, and }) =>
            and(
                eq(fields.id, importFileRecord.importId),
                eq(fields.userId, userId)
            )
    });

    if (!importRecord) {
        throw new Error('Import not found');
    }

    const currentFileCount = importRecord.importedFileCount || 0;
    const currentTransactionCount = importRecord.importedTransactionCount || 0;

    if (currentFileCount + 1 > (importRecord.fileCount || 0)) {
        throw new Error('Import file count exceeded');
    }

    // update import record
    const [updatedImportRecord] = await db
        .update(transactionImport)
        .set({
            importedFileCount: currentFileCount + 1,
            importedTransactionCount:
                currentTransactionCount + newTransactions.length,
            successAt:
                currentFileCount + 1 === importRecord.fileCount
                    ? new Date()
                    : null
        })
        .where(
            and(
                eq(transactionImport.id, importFileRecord.importId),
                eq(transactionImport.userId, userId)
            )
        )
        .returning();

    return {
        transactions: newTransactions,
        allImported: updatedImportRecord.successAt !== null,
        importId: importRecord.id
    };
};
