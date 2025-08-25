import { db } from '@/server/db';
import { tag } from '@/server/db/schemas';
import { TQueryInsertRecord, TQueryUpdateRecord } from '@/types/crud';
import { eq, InferInsertModel, InferSelectModel, Table } from 'drizzle-orm';
import { BuildSchema } from 'drizzle-zod';

export type BuildTableSchema<TTable extends Table> = BuildSchema<
    'update',
    TTable['_']['columns'],
    undefined
>;

// ===============================
// Factory Function that preserves return types
// ===============================

// Input constraints for type safety
type CreateInput<TTable extends Table> = TQueryInsertRecord<InferInsertModel<TTable>>;
type UpdateInput<TTable extends Table> = TQueryUpdateRecord<Partial<InferSelectModel<TTable>>> & {
    userId: string;
};

// More flexible type that preserves actual return types
type TParsedQueries<Q> = {
    [K in keyof Q]: Q[K] extends { queryFn: infer Fn } ? Fn : never;
};

const createQuery = <
    TTable extends Table,
    Q extends {
        create?: { queryFn: (input: CreateInput<TTable>) => Promise<unknown>; operation: string };
        updateById?: {
            queryFn: (input: UpdateInput<TTable>) => Promise<unknown>;
            operation: string;
        };
    },
>(config: {
    table: TTable;
    queries: Q;
}): TParsedQueries<Q> => {
    const { queries } = config;

    return Object.fromEntries(
        Object.entries(queries).map(([key, value]) => [
            key,
            value && typeof value === 'object' && 'queryFn' in value ? value.queryFn : undefined,
        ])
    ) as TParsedQueries<Q>;
};

// ===============================
// Implementation
// ===============================

const queries = createQuery({
    table: tag,
    queries: {
        create: {
            queryFn: async ({ data }) => {
                const newTag = await db.insert(tag).values(data).returning();
                console.log(newTag);
                return newTag[0];
            },
            operation: 'create',
        },
        updateById: {
            queryFn: async ({ data, id, userId: _userId }) => {
                const updatedTag = await db
                    .update(tag)
                    .set({ ...data, updatedAt: new Date() })
                    .where(eq(tag.id, id));
                return updatedTag[0];
            },
            operation: 'updateById',
        },
    },
});

// Example usage with proper typing - direct function access!
const createResult = await queries.create({ data: { name: 'test', userId: '1' } });
const updateResult = await queries.updateById({ data: { name: 'test' }, id: '1', userId: '1' });

// Type test - these should now have proper types instead of unknown
console.log('Create result:', createResult); // Should be inferred as the tag object
console.log('Update result:', updateResult); // Should be inferred as the update result

// Type assertions to verify (remove these in production)
// type CreateResultType = typeof createResult; // Should be the tag object type
// type UpdateResultType = typeof updateResult; // Should be the update result type
