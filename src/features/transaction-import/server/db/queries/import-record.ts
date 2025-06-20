import { db } from '@/server/db';
import { withDbQuery } from '@/server/lib/handler';
import { and, eq } from 'drizzle-orm';
import {
    transactionImport,
    transactionImportFile,
    type NewTransactionImport,
    type TransactionImport,
} from '../schema';

export const getAll = async ({ userId }: { userId: string }) =>
    withDbQuery({
        operation: 'get transaction imports by user ID',
        queryFn: async () => {
            return await db.query.transactionImport.findMany({
                where: and(
                    eq(transactionImport.userId, userId),
                    eq(transactionImport.isActive, true)
                ),
                with: {
                    connectedBankAccount: {
                        with: {
                            connectedBank: {
                                with: {
                                    globalBank: true,
                                },
                            },
                        },
                    },
                    files: {
                        where: eq(transactionImportFile.isActive, true),
                        orderBy: (files, { asc }) => [asc(files.createdAt)],
                    },
                },
                orderBy: (imports, { desc }) => [desc(imports.createdAt)],
            });
        },
    });

export const getById = async ({ id, userId }: { id: string; userId: string }) =>
    withDbQuery({
        operation: 'get transaction import by ID',
        queryFn: async () => {
            const result = await db.query.transactionImport.findFirst({
                where: and(
                    eq(transactionImport.id, id),
                    eq(transactionImport.userId, userId),
                    eq(transactionImport.isActive, true)
                ),
                with: {
                    connectedBankAccount: {
                        with: {
                            connectedBank: {
                                with: {
                                    globalBank: true,
                                },
                            },
                        },
                    },
                    files: {
                        where: eq(transactionImportFile.isActive, true),
                        orderBy: (files, { asc }) => [asc(files.createdAt)],
                    },
                },
            });
            return result || null;
        },
    });

export const create = async ({
    data,
}: {
    data: NewTransactionImport;
}): Promise<TransactionImport> =>
    withDbQuery({
        operation: 'create transaction import',
        queryFn: async () => {
            const [result] = await db.insert(transactionImport).values(data).returning();
            return result;
        },
    });

export const update = async ({
    id,
    data,
}: {
    id: string;
    data: Partial<NewTransactionImport>;
}): Promise<TransactionImport | null> =>
    withDbQuery({
        operation: 'update transaction import',
        queryFn: async () => {
            const [updated] = await db
                .update(transactionImport)
                .set({ ...data, updatedAt: new Date() })
                .where(eq(transactionImport.id, id))
                .returning();
            return updated || null;
        },
    });

export const remove = async ({ id }: { id: string }): Promise<void> =>
    withDbQuery({
        operation: 'delete transaction import',
        queryFn: async () => {
            await db
                .update(transactionImport)
                .set({ isActive: false, updatedAt: new Date() })
                .where(eq(transactionImport.id, id));
        },
    });
