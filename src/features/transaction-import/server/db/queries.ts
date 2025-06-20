import { eq, and, desc } from 'drizzle-orm';
import { withDbQuery } from '@/server/lib/handler';
import { db } from '@/server/db';
import type { NewTransactionImport } from './schema';
import { transactionImports } from './schema';

export const createTransactionImport = async (data: NewTransactionImport) =>
    withDbQuery({
        operation: 'Create transaction import record',
        queryFn: async () => {
            const [result] = await db.insert(transactionImports).values(data).returning();
            return result;
        },
    });

export const getTransactionImport = async ({ id, userId }: { id: string; userId: string }) =>
    withDbQuery({
        operation: 'Get transaction import by ID',
        queryFn: async () => {
            const [result] = await db
                .select()
                .from(transactionImports)
                .where(and(eq(transactionImports.id, id), eq(transactionImports.userId, userId)))
                .limit(1);
            return result;
        },
    });

export const getUserTransactionImports = async ({ userId }: { userId: string }) =>
    withDbQuery({
        operation: 'Get user transaction imports',
        queryFn: async () => {
            return db
                .select()
                .from(transactionImports)
                .where(and(eq(transactionImports.userId, userId), eq(transactionImports.isActive, true)))
                .orderBy(desc(transactionImports.createdAt));
        },
    });

export const updateTransactionImportStatus = async ({
    id,
    userId,
    status,
    totalRecords,
    successfulRecords,
    failedRecords,
    parseErrors,
    parsedTransactions,
    importedTransactions,
}: {
    id: string;
    userId: string;
    status: string;
    totalRecords?: string;
    successfulRecords?: string;
    failedRecords?: string;
    parseErrors?: any;
    parsedTransactions?: any;
    importedTransactions?: any;
}) =>
    withDbQuery({
        operation: 'Update transaction import status',
        queryFn: async () => {
            const [result] = await db
                .update(transactionImports)
                .set({
                    status,
                    totalRecords,
                    successfulRecords,
                    failedRecords,
                    parseErrors,
                    parsedTransactions,
                    importedTransactions,
                    updatedAt: new Date(),
                })
                .where(and(eq(transactionImports.id, id), eq(transactionImports.userId, userId)))
                .returning();
            return result;
        },
    });

export const deleteTransactionImport = async ({ id, userId }: { id: string; userId: string }) =>
    withDbQuery({
        operation: 'Soft delete transaction import',
        queryFn: async () => {
            const [result] = await db
                .update(transactionImports)
                .set({ isActive: false, updatedAt: new Date() })
                .where(and(eq(transactionImports.id, id), eq(transactionImports.userId, userId)))
                .returning();
            return result;
        },
    });