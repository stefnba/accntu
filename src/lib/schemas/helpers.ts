import { TOperationSchemaDefinition, TZodSchema } from '@/lib/schemas/types';
import { Table } from 'drizzle-orm';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

/**
 * Creates a record object where each field name maps to `true`
 * Used by Zod's omit/pick methods which expect { field: true } format
 * @param fields - Array of field names to convert
 * @returns Record mapping each field to true
 */
export const createTrueRecord = <T extends string | number | symbol>(
    fields: readonly T[]
): Record<T, true> => {
    return fields.reduce(
        (acc, field) => {
            acc[field] = true;
            return acc;
        },
        {} as Record<T, true>
    );
};

/** Internal type for creating schemas with omitted fields from Drizzle tables */
type CreateOmittedSchema<
    TTable extends Table,
    TOmitFields extends readonly (keyof TTable['_']['columns'])[],
> = z.ZodObject<Omit<ReturnType<typeof createInsertSchema<TTable>>['shape'], TOmitFields[number]>>;
/**
 * Creates a Zod schema from a Drizzle table with optional field omission
 * Overloaded to provide exact type inference for both use cases
 */
export function createBaseSchemaFromTable<TTable extends Table>(
    table: TTable
): ReturnType<typeof createInsertSchema<TTable>>;

export function createBaseSchemaFromTable<
    TTable extends Table,
    const TOmitFields extends readonly (keyof TTable['_']['columns'])[],
>(table: TTable, defaultOmitFields: TOmitFields): CreateOmittedSchema<TTable, TOmitFields>;

/**
 * Implementation that creates base schema with conditional field omission
 * @param table - Drizzle table to generate schema from
 * @param defaultOmitFields - Optional fields to exclude from the schema
 * @returns Zod schema with or without omitted fields
 */
export function createBaseSchemaFromTable<
    TTable extends Table,
    TOmitFields extends readonly (keyof TTable['_']['columns'])[],
>(table: TTable, defaultOmitFields?: TOmitFields) {
    const baseSchema = createInsertSchema(table);

    if (!defaultOmitFields || defaultOmitFields.length === 0) {
        return baseSchema;
    }

    return baseSchema.omit(defaultOmitFields.length > 0 ? createTrueRecord(defaultOmitFields) : {});
}

/**
 * Standalone helper for dynamic operation schema creation with perfect intellisense.
 * Alternative to FeatureSchema.helpers.operation() for direct imports.
 *
 * Executes the function immediately to return a plain object that TypeScript can infer.
 * Use when you need to share schemas or add conditional logic within operations.
 *
 * @param fn - Function that returns an operation schema definition
 * @returns The resolved operation schema with full type support
 *
 * @example
 * ```typescript
 * import { operation } from '@/lib/schemas';
 *
 * assignToTransaction: operation(() => {
 *   const shared = z.object({ transactionId: z.string(), tagIds: z.array(z.string()) });
 *   return { service: shared, endpoint: shared };
 * })
 * ```
 */
export const operation = <T extends TOperationSchemaDefinition>(fn: () => T): T => fn();

/**
 * Builds a CRUD operation schema with optional fields - overloaded for exact type inference
 */
// With data and filters
export function buildCrudOpSchema<
    const TData extends TZodSchema,
    const TFilters extends TZodSchema,
>(input: {
    userId: true;
    id: true;
    data: TData;
    filters: TFilters;
}): z.ZodObject<{ userId: z.ZodString; id: z.ZodString; data: TData; filters: TFilters }>;

export function buildCrudOpSchema<
    const TData extends TZodSchema,
    const TFilters extends TZodSchema,
>(input: {
    userId: true;
    id?: false;
    data: TData;
    filters: TFilters;
}): z.ZodObject<{ userId: z.ZodString; data: TData; filters: TFilters }>;

export function buildCrudOpSchema<
    const TData extends TZodSchema,
    const TFilters extends TZodSchema,
>(input: {
    userId?: false;
    id: true;
    data: TData;
    filters: TFilters;
}): z.ZodObject<{ id: z.ZodString; data: TData; filters: TFilters }>;

export function buildCrudOpSchema<
    const TData extends TZodSchema,
    const TFilters extends TZodSchema,
>(input: {
    userId?: false;
    id?: false;
    data: TData;
    filters: TFilters;
}): z.ZodObject<{ data: TData; filters: TFilters }>;

// With data only
export function buildCrudOpSchema<const TData extends TZodSchema>(input: {
    userId: true;
    id: true;
    data: TData;
    filters?: undefined;
}): z.ZodObject<{ userId: z.ZodString; id: z.ZodString; data: TData }>;

export function buildCrudOpSchema<const TData extends TZodSchema>(input: {
    userId: true;
    id?: false;
    data: TData;
    filters?: undefined;
}): z.ZodObject<{ userId: z.ZodString; data: TData }>;

export function buildCrudOpSchema<const TData extends TZodSchema>(input: {
    userId?: false;
    id: true;
    data: TData;
    filters?: undefined;
}): z.ZodObject<{ id: z.ZodString; data: TData }>;

export function buildCrudOpSchema<const TData extends TZodSchema>(input: {
    userId?: false;
    id?: false;
    data: TData;
    filters?: undefined;
}): z.ZodObject<{ data: TData }>;

// With filters only
export function buildCrudOpSchema<const TFilters extends TZodSchema>(input: {
    userId: true;
    id: true;
    data?: undefined;
    filters: TFilters;
}): z.ZodObject<{ userId: z.ZodString; id: z.ZodString; filters: TFilters }>;

export function buildCrudOpSchema<const TFilters extends TZodSchema>(input: {
    userId: true;
    id?: false;
    data?: undefined;
    filters: TFilters;
}): z.ZodObject<{ userId: z.ZodString; filters: TFilters }>;

export function buildCrudOpSchema(input: {
    userId: true;
    id?: false;
    data?: undefined;
    filters?: undefined;
}): z.ZodObject<{ userId: z.ZodString }>;

export function buildCrudOpSchema<const TFilters extends TZodSchema>(input: {
    userId?: false;
    id: true;
    data?: undefined;
    filters: TFilters;
}): z.ZodObject<{ id: z.ZodString; filters: TFilters }>;

export function buildCrudOpSchema<const TFilters extends TZodSchema>(input: {
    userId?: false;
    id?: false;
    data?: undefined;
    filters: TFilters;
}): z.ZodObject<{ filters: TFilters }>;

// Without data or filters
export function buildCrudOpSchema(input: {
    userId: true;
    id: true;
    data?: undefined;
    filters?: undefined;
}): z.ZodObject<{ userId: z.ZodString; id: z.ZodString }>;

export function buildCrudOpSchema(input: {
    userId: true;
    id?: false;
    data?: undefined;
    filters?: undefined;
}): z.ZodObject<{ userId: z.ZodString }>;

export function buildCrudOpSchema(input: {
    userId?: false;
    id: true;
    data?: undefined;
    filters?: undefined;
}): z.ZodObject<{ id: z.ZodString }>;

export function buildCrudOpSchema(input: {
    userId?: false;
    id?: false;
    data?: undefined;
    filters?: undefined;
}): void;

/**
 * Implementation that builds the schema based on input configuration
 */
export function buildCrudOpSchema(input: {
    userId?: boolean;
    id?: boolean;
    filters?: TZodSchema;
    data?: TZodSchema;
}): TZodSchema {
    const shape: any = {};

    if (input.userId) {
        shape.userId = z.string();
    }

    if (input.id) {
        shape.id = z.string();
    }

    if (input.data) {
        shape.data = input.data;
    }

    if (input.filters) {
        shape.filters = input.filters;
    }

    return z.object(shape);
}
