import { withDbQuery } from '@/server/lib/handler';
import { and, eq } from 'drizzle-orm';
import { db } from '../../../../../server/db';
import { globalBank, type GlobalBank } from '../schemas';

/**
 * Get all global banks
 * @returns All global banks
 */
export const getAll = async (): Promise<GlobalBank[]> =>
    withDbQuery({
        operation: 'get all global banks',
        queryFn: async () => {
            return await db.select().from(globalBank).where(eq(globalBank.isActive, true));
        },
    });

/**
 * Get a global bank by id
 * @param id - The id of the global bank
 * @returns The global bank
 */
export const getById = async ({ id }: { id: string }) =>
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
 * Get all global banks by country
 * @param country - The country of the global banks
 * @returns All global banks by country
 */
export const getByCountry = async ({ country }: { country: string }): Promise<GlobalBank[]> =>
    withDbQuery({
        operation: 'get global banks by country',
        queryFn: async () => {
            return await db
                .select()
                .from(globalBank)
                .where(and(eq(globalBank.country, country), eq(globalBank.isActive, true)));
        },
    });

/**
 * Search for global banks
 * @param query - The query to search for
 * @param country - The country to search for
 * @returns The global banks
 */
export const search = async ({
    query,
    country,
}: {
    query: string;
    country?: string;
}): Promise<GlobalBank[]> =>
    withDbQuery({
        operation: 'search global banks',
        queryFn: async () => {
            let whereClause = and(
                eq(globalBank.isActive, true)
                // Add text search when available in your database
                // ilike(globalBank.name, `%${query}%`)
            );

            if (country) {
                whereClause = and(whereClause, eq(globalBank.country, country));
            }

            return await db.select().from(globalBank).where(whereClause);
        },
    });
