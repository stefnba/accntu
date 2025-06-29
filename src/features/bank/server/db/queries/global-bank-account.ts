import { TGlobalBankAccountQuerySchemas } from '@/features/bank/schemas/global-bank-account';
import { globalBankAccount } from '@/features/bank/server/db/schemas';
import { TQuerySelectRecords } from '@/lib/schemas';
import { db } from '@/server/db';
import { withDbQuery } from '@/server/lib/handler';
import { and, eq } from 'drizzle-orm';

/**
 * Get all global bank accounts
 * @param filters - The filters to apply to the query
 * @returns All global bank accounts
 */
const getAll = async ({
    filters,
}: TQuerySelectRecords<{
    globalBankId?: string;
}>): Promise<TGlobalBankAccountQuerySchemas['select'][]> =>
    withDbQuery({
        operation: 'get all global bank accounts',
        queryFn: async () => {
            const conditions = [eq(globalBankAccount.isActive, true)];

            if (filters?.globalBankId) {
                conditions.push(eq(globalBankAccount.globalBankId, filters.globalBankId));
            }

            return await db
                .select()
                .from(globalBankAccount)
                .where(and(...conditions));
        },
    });

/**
 * Get a global bank account by id
 * @param id - The id of the global bank account
 * @returns The global bank account
 */
const getById = async ({
    id,
}: {
    id: string;
}): Promise<TGlobalBankAccountQuerySchemas['select'] | null> =>
    withDbQuery({
        operation: 'get global bank account by ID',
        queryFn: async () => {
            const result = await db
                .select()
                .from(globalBankAccount)
                .where(eq(globalBankAccount.id, id))
                .limit(1);
            return result[0] || null;
        },
    });

/**
 * Create a global bank account.
 * Only for admin use.
 * @param data - The data to create the global bank account
 * @returns The created global bank account
 */
const create = async (data: any): Promise<TGlobalBankAccountQuerySchemas['select'] | null> =>
    withDbQuery({
        operation: 'create global bank account',
        queryFn: async () => {
            const [result] = await db.insert(globalBankAccount).values(data).returning();
            return result || null;
        },
    });

/**
 * Update a global bank account.
 * Only for admin use.
 * @param id - The id of the global bank account
 * @param data - The data to update
 * @returns The updated global bank account
 */
const update = async ({
    id,
    ...data
}: { id: string } & any): Promise<TGlobalBankAccountQuerySchemas['select'] | null> =>
    withDbQuery({
        operation: 'update global bank account',
        queryFn: async () => {
            const [result] = await db
                .update(globalBankAccount)
                .set(data)
                .where(eq(globalBankAccount.id, id))
                .returning();
            return result || null;
        },
    });

/**
 * Remove a global bank account (soft delete)
 * Only for admin use.
 * @param id - The id of the global bank account
 * @returns The updated global bank account
 */
const remove = async ({
    id,
}: {
    id: string;
}): Promise<TGlobalBankAccountQuerySchemas['select'] | null> =>
    withDbQuery({
        operation: 'remove global bank account',
        queryFn: async () => {
            const [result] = await db
                .update(globalBankAccount)
                .set({ isActive: false })
                .where(eq(globalBankAccount.id, id))
                .returning();
            return result || null;
        },
    });

export const globalBankAccountQueries = {
    getAll,
    getById,
    create,
    update,
    remove,
};
