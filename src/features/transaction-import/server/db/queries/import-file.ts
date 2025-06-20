import { db } from '@/server/db';
import { withDbQuery } from '@/server/lib/handler';
import { and, eq } from 'drizzle-orm';
import {
    transactionImportFile,
    type NewTransactionImportFile,
    type TransactionImportFile,
} from '../schemas';

export const getAll = async ({ importId }: { importId: string }) =>
    withDbQuery({
        operation: 'get transaction import files by import ID',
        queryFn: async () => {
            return await db.query.transactionImportFile.findMany({
                where: and(
                    eq(transactionImportFile.importId, importId),
                    eq(transactionImportFile.isActive, true)
                ),
                with: {
                    import: true,
                },
                orderBy: (files, { asc }) => [asc(files.createdAt)],
            });
        },
    });

export const getById = async ({ id }: { id: string }) =>
    withDbQuery({
        operation: 'get transaction import file by ID',
        queryFn: async () => {
            const result = await db.query.transactionImportFile.findFirst({
                where: and(
                    eq(transactionImportFile.id, id),
                    eq(transactionImportFile.isActive, true)
                ),
                with: {
                    import: true,
                },
            });
            return result || null;
        },
    });

export const create = async ({
    data,
}: {
    data: NewTransactionImportFile;
}): Promise<TransactionImportFile> =>
    withDbQuery({
        operation: 'create transaction import file',
        queryFn: async () => {
            const [result] = await db.insert(transactionImportFile).values(data).returning();
            return result;
        },
    });

export const update = async ({
    id,
    data,
}: {
    id: string;
    data: Partial<NewTransactionImportFile>;
}): Promise<TransactionImportFile | null> =>
    withDbQuery({
        operation: 'update transaction import file',
        queryFn: async () => {
            const [updated] = await db
                .update(transactionImportFile)
                .set({ ...data, updatedAt: new Date() })
                .where(eq(transactionImportFile.id, id))
                .returning();
            return updated || null;
        },
    });

export const remove = async ({ id }: { id: string }): Promise<void> =>
    withDbQuery({
        operation: 'delete transaction import file',
        queryFn: async () => {
            await db
                .update(transactionImportFile)
                .set({ isActive: false, updatedAt: new Date() })
                .where(eq(transactionImportFile.id, id));
        },
    });

export const updateStatus = async ({
    id,
    status,
    transactionCount,
    importedTransactionCount,
    parseErrors,
    parsedTransactions,
}: {
    id: string;
    status: string;
    transactionCount?: number;
    importedTransactionCount?: number;
    parseErrors?: unknown[];
    parsedTransactions?: unknown[];
}): Promise<TransactionImportFile | null> =>
    withDbQuery({
        operation: 'update transaction import file status',
        queryFn: async () => {
            const updateData: Partial<NewTransactionImportFile> = {
                status,
                updatedAt: new Date(),
            };

            if (transactionCount !== undefined) updateData.transactionCount = transactionCount;
            if (importedTransactionCount !== undefined)
                updateData.importedTransactionCount = importedTransactionCount;
            if (parseErrors !== undefined) updateData.parseErrors = parseErrors;
            if (parsedTransactions !== undefined)
                updateData.parsedTransactions = parsedTransactions;
            if (status === 'imported') updateData.importedAt = new Date();

            const [updated] = await db
                .update(transactionImportFile)
                .set(updateData)
                .where(eq(transactionImportFile.id, id))
                .returning();
            return updated || null;
        },
    });
