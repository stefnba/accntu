import { globalBankSchemas } from '@/features/bank/schemas/global-bank';
import { globalBank } from '@/features/bank/server/db/tables';
import { db } from '@/server/db';
import { createFeatureQueries, InferFeatureType } from '@/server/lib/db/query';
import { and, eq, ilike } from 'drizzle-orm';

export const globalBankQueries = createFeatureQueries
    .registerSchema(globalBankSchemas)
    /**
     * Create a global bank
     */
    .addQuery('create', {
        operation: 'create global bank',
        fn: async ({ data }) => {
            const [result] = await db.insert(globalBank).values(data).returning();
            return result || null;
        },
    })
    /**
     * Get many global banks
     */
    .addQuery('getMany', {
        operation: 'get global banks with filters',
        fn: async ({ filters, pagination }) => {
            const conditions = [eq(globalBank.isActive, true)];

            if (filters?.query) {
                conditions.push(ilike(globalBank.name, `%${filters.query}%`));
            }

            if (filters?.country) {
                conditions.push(eq(globalBank.country, filters.country));
            }

            // todo: fix this
            // if (filters?.integrationTypes?.length) {
            //     conditions.push(e(globalBank.integrationTypes, filters.integrationTypes));
            // }

            return await db
                .select()
                .from(globalBank)
                .where(and(...conditions))
                .limit(pagination?.pageSize || 50)
                .offset(((pagination?.page || 1) - 1) * (pagination?.pageSize || 50));
        },
    })
    /**
     * Get a global bank by ID
     */
    .addQuery('getById', {
        operation: 'get global bank by ID',
        fn: async ({ ids }) => {
            const [result] = await db
                .select()
                .from(globalBank)
                .where(eq(globalBank.id, ids.id))
                .limit(1);
            return result || null;
        },
    })
    /**
     * Update a global bank by ID
     */
    .addQuery('updateById', {
        operation: 'update global bank',
        fn: async ({ ids, data }) => {
            const [result] = await db
                .update(globalBank)
                .set(data)
                .where(eq(globalBank.id, ids.id))
                .returning();
            return result || null;
        },
    })
    /**
     * Remove a global bank by ID
     */
    .addQuery('removeById', {
        operation: 'remove global bank',
        fn: async ({ ids }) => {
            const [result] = await db
                .update(globalBank)
                .set({ isActive: false })
                .where(eq(globalBank.id, ids.id))
                .returning();
            return result || null;
        },
    });

export type TGlobalBank = InferFeatureType<typeof globalBankQueries>;
