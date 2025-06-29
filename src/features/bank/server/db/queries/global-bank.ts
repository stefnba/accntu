import { TGlobalBankQuerySchemas, TSearchGlobalBanks } from '@/features/bank/schemas/global-bank';
import { globalBank } from '@/features/bank/server/db/schemas';
import {
    TQueryInsertRecord,
    TQuerySelectRecordById,
    TQuerySelectRecords,
    TQueryUpdateRecord,
} from '@/lib/schemas';
import { db } from '@/server/db';
import { withDbQuery } from '@/server/lib/handler';
import { and, eq, ilike } from 'drizzle-orm';

/**
 * Get all global banks with optional filters
 * @param filters - Optional filters for query and country
 * @returns All global banks matching filters
 */
const getAll = async ({
    filters,
}: TQuerySelectRecords<TSearchGlobalBanks>): Promise<TGlobalBankQuerySchemas['select'][]> =>
    withDbQuery({
        operation: 'get all global banks',
        queryFn: async () => {
            // Default conditions, only active banks
            const conditions = [eq(globalBank.isActive, true)];

            // Add text search if query is provided
            if (filters?.query) {
                conditions.push(ilike(globalBank.name, `%${filters.query}%`));
            }

            // Add country filter if provided
            if (filters?.country) {
                conditions.push(eq(globalBank.country, filters.country));
            }

            return await db
                .select()
                .from(globalBank)
                .where(and(...conditions));
        },
    });

/**
 * Get a global bank by id
 * @param id - The id of the global bank
 * @returns The global bank
 */
const getById = async ({ id }: TQuerySelectRecordById) =>
    withDbQuery({
        operation: 'get global bank by ID',
        queryFn: async () => {
            const [result] = await db
                .select()
                .from(globalBank)
                .where(eq(globalBank.id, id))
                .limit(1);
            return result;
        },
    });

/**
 * Create a global bank
 * @param data - The data to create the global bank
 * @returns The created global bank
 */
const create = async ({
    data,
}: TQueryInsertRecord<TGlobalBankQuerySchemas['insert']>): Promise<
    TGlobalBankQuerySchemas['select'] | null
> =>
    withDbQuery({
        operation: 'create global bank',
        queryFn: async () => {
            const [result] = await db.insert(globalBank).values(data).returning();
            return result || null;
        },
    });

/**
 * Update a global bank
 * @param id - The id of the global bank
 * @param data - The data to update
 * @returns The updated global bank
 */
const update = async ({
    id,
    data,
}: TQueryUpdateRecord<TGlobalBankQuerySchemas['update']>): Promise<
    TGlobalBankQuerySchemas['select'] | null
> =>
    withDbQuery({
        operation: 'update global bank',
        queryFn: async () => {
            const [result] = await db
                .update(globalBank)
                .set(data)
                .where(eq(globalBank.id, id))
                .returning();
            return result || null;
        },
    });

/**
 * Remove a global bank (soft delete)
 * @param id - The id of the global bank
 * @returns The updated global bank
 */
const remove = async ({ id }: { id: string }): Promise<TGlobalBankQuerySchemas['select'] | null> =>
    withDbQuery({
        operation: 'remove global bank',
        queryFn: async () => {
            const [result] = await db
                .update(globalBank)
                .set({ isActive: false })
                .where(eq(globalBank.id, id))
                .returning();
            return result || null;
        },
    });

export const globalBankQueries = {
    getAll,
    getById,
    create,
    update,
    remove,
};
