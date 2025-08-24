import { db } from '@/server/db';
import { tag } from '@/server/db/schemas';
import { eq, InferInsertModel, Table } from 'drizzle-orm';

// Infer the input type directly from Drizzle's InferInsertModel for better compatibility
type TInsertInput<T extends Table> = InferInsertModel<T>;
type TUpdateInput<T extends Table> = Partial<InferInsertModel<T>>;

interface CoreQueries<T extends Table> {
    create: {
        queryFn: (validatedInput: TInsertInput<T>) => Promise<null>;
        operation: string;
    };
    update: {
        queryFn: (validatedInput: TUpdateInput<T>) => Promise<null>;
        operation: string;
    };
}

interface FeatureQueryFactoryConfig<T extends Table, Q extends Partial<CoreQueries<T>>> {
    table: T; // Make table parameter strongly typed
    queries: Q;
}

const createFeatureQueries = <T extends Table>(table: T) => {
    return <Q extends Partial<CoreQueries<T>>>(queries: Q): Q => {
        // TODO: Add query validation and processing logic here
        // For now, return the queries as-is since type inference is working

        return queries;
    };
};

// Example usage demonstrating proper type inference
const tagQueries = createFeatureQueries(tag)({
    create: {
        queryFn: async (validatedInput) => {
            // ✅ validatedInput should now be properly typed based on TInsertInput<typeof tag>
            // without needing explicit type annotations

            await db.insert(tag).values(validatedInput);
            return null;
        },
        operation: 'create tag',
    },
    update: {
        queryFn: async (validatedInput) => {
            // ✅ validatedInput should now be properly typed as TUpdateInput<typeof tag>
            // without needing explicit type annotations

            await db.update(tag).set(validatedInput).where(eq(tag.id, validatedInput.id!));
            return null;
        },
        operation: 'update tag',
    },
});

// Export for demonstration
export { tagQueries };
