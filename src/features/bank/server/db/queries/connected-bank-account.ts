import { TConnectedBankAccountQuerySchemas } from '@/features/bank/schemas/connected-bank-account';
import { connectedBank, connectedBankAccount } from '@/features/bank/server/db/schemas';
import {
    TQueryDeleteUserRecord,
    TQueryInsertUserRecord,
    TQuerySelectUserRecordById,
    TQuerySelectUserRecords,
    TQueryUpdateUserRecord,
} from '@/lib/schemas';
import { db } from '@/server/db';
import { withDbQuery } from '@/server/lib/handler';
import { and, eq } from 'drizzle-orm';

/**
 * Get all connected bank accounts by user id
 * @param userId - The id of the user
 * @returns All connected bank accounts by user id
 */
const getAll = async ({
    userId,
    filters,
}: TQuerySelectUserRecords<{
    connectedBankId?: string;
}>) =>
    withDbQuery({
        operation: 'get connected bank accounts by user ID',
        queryFn: async () => {
            const whereClause = [
                eq(connectedBankAccount.userId, userId),
                eq(connectedBankAccount.isActive, true),
            ];
            if (filters?.connectedBankId) {
                whereClause.push(eq(connectedBankAccount.connectedBankId, filters.connectedBankId));
            }

            const result = await db
                .select()
                .from(connectedBankAccount)
                .innerJoin(
                    connectedBank,
                    eq(connectedBankAccount.connectedBankId, connectedBank.id)
                )
                .where(and(...whereClause));

            return result;
        },
    });

/**
 * Create a connected bank account
 * @param data - The data to create the connected bank account
 * @returns The created connected bank account
 */
const create = async ({
    data,
    userId,
}: TQueryInsertUserRecord<TConnectedBankAccountQuerySchemas['insert']>) =>
    withDbQuery({
        operation: 'create connected bank account',
        queryFn: async () => {
            const result = await db
                .insert(connectedBankAccount)
                .values({ ...data, userId })
                .returning();
            return result[0];
        },
    });

/**
 * Get a connected bank account by id
 * @param id - The id of the connected bank account
 * @returns The connected bank account
 */
const getById = async ({ id, userId }: TQuerySelectUserRecordById) =>
    withDbQuery({
        operation: 'get connected bank account by ID',
        queryFn: async () => {
            const result = await db
                .select()
                .from(connectedBankAccount)
                .where(
                    and(eq(connectedBankAccount.id, id), eq(connectedBankAccount.userId, userId))
                )
                .limit(1);
            return result[0] || null;
        },
    });

/**
 * Update a connected bank account
 * @param id - The id of the connected bank account
 * @param data - The data to update the connected bank account
 * @returns The updated connected bank account
 */
const update = async ({
    id,
    data,
    userId,
}: TQueryUpdateUserRecord<TConnectedBankAccountQuerySchemas['update']>) =>
    withDbQuery({
        operation: 'update connected bank account',
        queryFn: async () => {
            const result = await db
                .update(connectedBankAccount)
                .set(data)
                .where(
                    and(eq(connectedBankAccount.id, id), eq(connectedBankAccount.userId, userId))
                )
                .returning();
            return result[0];
        },
    });

/**
 * Remove a connected bank account
 * @param id - The id of the connected bank account
 * @param userId - The id of the user
 * @returns The removed connected bank account
 */
const remove = async ({ id, userId }: TQueryDeleteUserRecord) =>
    withDbQuery({
        operation: 'remove connected bank account',
        queryFn: async () => {
            const result = await db
                .delete(connectedBankAccount)
                .where(
                    and(eq(connectedBankAccount.id, id), eq(connectedBankAccount.userId, userId))
                )
                .returning();
            return result[0];
        },
    });

export const connectedBankAccountQueries = {
    getAll,
    create,
    getById,
    update,
    remove,
};
