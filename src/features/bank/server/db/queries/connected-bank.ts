import { type TConnectedBankQuerySchemas } from '@/features/bank/schemas/connected-bank';
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
import { connectedBank } from '../schemas';

/**
 * Get all connected banks by user id
 * @param userId - The id of the user
 * @returns All connected banks by user id
 */
const getAll = async ({ userId, filters }: TQuerySelectUserRecords<{ globalBankId?: string }>) =>
    withDbQuery({
        operation: 'get connected banks by user ID',
        queryFn: async () => {
            const whereClause = [
                eq(connectedBank.userId, userId),
                eq(connectedBank.isActive, true),
            ];

            if (filters?.globalBankId) {
                whereClause.push(eq(connectedBank.globalBankId, filters.globalBankId));
            }

            const where = and(...whereClause);

            return await db.query.connectedBank.findMany({
                where,
                with: {
                    globalBank: true,
                    connectedBankAccounts: {
                        with: {
                            globalBankAccount: true,
                        },
                    },
                },
            });
        },
    });

/**
 * Get a connected bank by id
 * @param id - The id of the connected bank
 * @param userId - The id of the user
 * @returns The connected bank
 */
const getById = async ({ id, userId }: TQuerySelectUserRecordById) =>
    withDbQuery({
        operation: 'get connected bank by ID',
        queryFn: async () => {
            const result = await db.query.connectedBank.findFirst({
                where: and(eq(connectedBank.id, id), eq(connectedBank.userId, userId)),
                with: {
                    globalBank: true,
                    connectedBankAccounts: {
                        with: {
                            globalBankAccount: true,
                        },
                    },
                },
            });
            return result || null;
        },
    });

/**
 * Create a connected bank
 * @param data - The data to create the connected bank
 * @returns The created connected bank
 */
const create = async ({
    data,
    userId,
}: TQueryInsertUserRecord<TConnectedBankQuerySchemas['insert']>) =>
    withDbQuery({
        operation: 'create connected bank',
        queryFn: async () => {
            const result = await db
                .insert(connectedBank)
                .values({ ...data, userId })
                .onConflictDoNothing()
                .returning();
            return result[0];
        },
        allowNull: true,
    });

const update = async ({
    id,
    data,
    userId,
}: TQueryUpdateUserRecord<TConnectedBankQuerySchemas['update']>) =>
    withDbQuery({
        operation: 'update connected bank',
        queryFn: async () => {
            const result = await db
                .update(connectedBank)
                .set(data)
                .where(and(eq(connectedBank.id, id), eq(connectedBank.userId, userId)))
                .returning();
            return result[0];
        },
    });

/**
 * Remove a connected bank
 * @param id - The id of the connected bank
 * @param userId - The id of the user
 * @returns The removed connected bank
 */
const remove = async ({ id, userId }: TQueryDeleteUserRecord) =>
    withDbQuery({
        operation: 'remove connected bank',
        queryFn: async () => {
            return await db
                .delete(connectedBank)
                .where(and(eq(connectedBank.id, id), eq(connectedBank.userId, userId)));
        },
    });

export const connectedBankQueries = {
    getAll,
    getById,
    update,
    create,
    remove,
};
