import { getFieldsAsArray, getFieldsAsArrayConstrained } from '@/lib/utils/zod';
import { TOrderBy } from '@/server/lib/db/query/table-operations';
import { orderingSchema, paginationSchema } from '@/server/lib/db/table/feature-config/schemas';
import {
    ConditionalArrayShape,
    ConditionalObjectShape,
    InferTableTypes,
    TFeatureTableConfig,
} from '@/server/lib/db/table/feature-config/types';
import { AppErrors } from '@/server/lib/error';
import { Prettify } from '@/types/utils';
import { TZodShape } from '@/types/zod';
import { Table } from 'drizzle-orm';
import { createInsertSchema, createUpdateSchema } from 'drizzle-zod';
import z from 'zod';

export class FeatureTableConfig<TTable extends Table, C extends TFeatureTableConfig<TTable>> {
    config: C;

    constructor({ config }: { config: C }) {
        this.config = config;
    }

    // ========================================
    // Table
    // ========================================

    /**
     * Get the table.
     *
     * Returns the table object.
     */
    getTable(): TTable {
        if (!this.config.table) {
            console.error('FeatureTableConfig: table is undefined in config', this.config);
        }
        return this.config.table;
    }

    // ========================================
    // Base
    // ========================================

    /**
     * Get the base schema for the table.
     *
     * This schema represents the foundational structure of the table data,
     * often used as a starting point for other operations.
     */
    getBaseSchema(): z.ZodObject<C['base']> {
        return z.object(this.config.base);
    }

    // ========================================
    // Pagination
    // ========================================

    /**
     * Get the pagination schema.
     *
     * Returns the Zod schema used to validate pagination input (page, pageSize).
     */
    getPaginationSchema(): z.ZodObject<C['pagination']> {
        return z.object(this.config.pagination);
    }

    /**
     * Validate and normalize pagination input data.
     *
     * Attempts to parse the input using the pagination schema. If validation fails,
     * returns default values with page and pageSize undefined.
     *
     * @param input - Raw input (should be an object containing a `pagination` key).
     * @returns The normalized pagination object.
     *
     * @example
     * ```ts
     * // Returns: { page: 2, pageSize: 10 }
     * config.validatePaginationInput({ pagination: { page: 2, pageSize: 10 } });
     *
     * // Returns: { page: undefined, pageSize: undefined }
     * config.validatePaginationInput({});
     * ```
     */
    validatePaginationInput(input: unknown) {
        // if no pagination schema, return undefined
        if (!this.hasPaginationSchema()) return undefined;

        // create a schema with the pagination schema as a partial
        const schema = z.object({
            pagination: paginationSchema.partial(),
        });

        console.log('input', input);
        const validated = schema.safeParse(input);
        if (validated.success) {
            return validated.data.pagination;
        }
        return undefined;
    }

    /**
     * Type guard: Check if pagination schema is configured (non-empty).
     */
    hasPaginationSchema(): this is FeatureTableConfig<TTable, C & { pagination: TZodShape }> {
        return Object.keys(this.config.pagination).length > 0;
    }

    // ========================================
    // Filters
    // ========================================

    /**
     * Get the filters schema.
     *
     * Returns the Zod schema configured for filtering query results.
     */
    getFiltersSchema(): z.ZodObject<C['filters']> {
        return z.object(this.config.filters);
    }

    /**
     * Type guard: Check if filters schema is configured (non-empty).
     */
    hasFiltersSchema(): this is FeatureTableConfig<TTable, C & { filters: TZodShape }> {
        return Object.keys(this.config.filters).length > 0;
    }

    /**
     * Validate filters input.
     *
     * @param input - Raw input object containing filter fields
     * @returns Validated filters object or undefined if validation fails
     */
    validateFiltersInput(
        input: unknown
    ):
        | z.infer<z.ZodObject<{ [k in keyof C['filters']]: z.ZodOptional<C['filters'][k]> }>>
        | undefined {
        if (!this.hasFiltersSchema()) return undefined;

        const schema = z.object({
            filters: this.getFiltersSchema().partial(),
        });

        const validated = schema.safeParse(input);
        if (validated.success) {
            return validated.data.filters;
        }
        return undefined;
    }

    // ========================================
    // Ordering
    // ========================================

    /**
     * Type guard: Check if ordering schema is configured (non-empty).
     */
    hasOrderingSchema(): this is FeatureTableConfig<TTable, C & { ordering: TZodShape }> {
        return Object.keys(this.config.ordering).length > 0;
    }

    /**
     * Validate ordering input.
     *
     * @param input - Raw input object containing ordering array
     * @returns Validated ordering array or undefined if validation fails
     */
    validateOrderingInput(input: unknown): TOrderBy<TTable> | undefined {
        if (!this.hasOrderingSchema()) return undefined;

        const schema = orderingSchema(this.config.table);

        const validated = schema.safeParse(input);
        if (validated.success) {
            return validated.data.ordering;
        }
        return undefined;
    }

    /**
     * Get the ordering schema.
     *
     * Returns the Zod schema configured for ordering query results.
     */
    getOrderingSchema(): C['ordering'] {
        return this.config.ordering;
    }

    // ========================================
    // Many Input
    // ========================================

    /**
     * Build the input schema for "get many" operations.
     *
     * This method combines userId, ordering, filters, and pagination schemas into a single Zod schema
     * used to validate and parse inputs for queries that retrieve multiple records.
     *
     * @returns Zod schema containing userId, ordering, filters, and pagination fields.
     *
     * @example
     * ```ts
     * const manyInputSchema = config.buildManyInputSchema();
     * const validated = manyInputSchema.parse({
     *   userId: 'user-123',
     *   ordering: [{ field: 'createdAt', direction: 'desc' }],
     *   filters: { name: 'MyTag' },
     *   pagination: { page: 1, pageSize: 10 }
     * });
     * ```
     */
    buildManyInputSchema() {
        const shape: TZodShape = {};

        // filters
        const filtersSchema = z.object({
            filters: this.getFiltersSchema().partial().optional(),
        });
        if (this.hasFiltersSchema()) {
            Object.assign(shape, filtersSchema.shape);
        }

        // ordering
        const orderingSchema = z.object({
            ordering: this.getOrderingSchema().optional(),
        });
        if (this.hasOrderingSchema()) {
            Object.assign(shape, {
                ordering: orderingSchema.shape,
            });
        }

        // pagination
        type PaginationShape = C['pagination'];
        const paginationSchemaForMany: z.ZodObject<{
            pagination: z.ZodOptional<
                z.ZodObject<{
                    [K in keyof PaginationShape]: z.ZodOptional<PaginationShape[K]>;
                }>
            >;
        }> = z.object({
            pagination: this.getPaginationSchema().partial().optional(),
        });
        if (this.hasPaginationSchema()) {
            Object.assign(shape, {
                pagination: paginationSchemaForMany.shape,
            });
        }

        // userId
        if (this.hasUserIdSchema()) {
            Object.assign(shape, this.getUserIdSchema().shape);
        }

        return z.object(shape) as z.ZodObject<
            ConditionalObjectShape<C['filters'], (typeof filtersSchema)['shape']> &
                ConditionalObjectShape<C['pagination'], (typeof paginationSchemaForMany)['shape']> &
                ConditionalArrayShape<C['ordering'], (typeof orderingSchema)['shape']> &
                C['userId']
        >;
    }

    // ========================================
    // Create
    // ========================================

    /**
     * Get the schema for creating new records (data only).
     *
     * This schema represents the fields required to create a new record,
     * excluding system fields like ID or UserID if they are handled separately.
     */
    getCreateDataSchema(): z.ZodObject<C['createData']> {
        return z.object(this.config.createData);
    }

    /**
     * Build a Zod schema for create/insert operations.
     *
     * Combines insert data schema with user ID schema (if configured).
     * Used to validate input for creating new records.
     *
     * @returns Zod schema containing { data: InsertData, userId?: string }
     *
     * @example
     * ```ts
     * const createSchema = config.buildCreateInputSchema();
     * const validated = createSchema.parse({
     *   data: { name: 'New Item' },
     *   userId: 'user-123'
     * });
     * ```
     */
    buildCreateInputSchema() {
        return z.object({ data: this.getCreateDataSchema(), ...this.getUserIdSchema().shape });
    }

    /**
     * Build a Zod schema for bulk create operations.
     *
     * Similar to buildCreateInputSchema but accepts an array of records.
     * Combines array of insert data with user ID schema.
     *
     * @returns Zod schema containing { data: InsertData[], userId?: string }
     *
     * @example
     * ```ts
     * const createManySchema = config.buildCreateManyInputSchema();
     * const validated = createManySchema.parse({
     *   data: [{ name: 'Item 1' }, { name: 'Item 2' }],
     *   userId: 'user-123'
     * });
     * ```
     */
    buildCreateManyInputSchema() {
        return z.object({
            data: z.array(this.getCreateDataSchema()),
            ...this.getUserIdSchema().shape,
        });
    }

    /**
     * Validate and transform input data for table insert operations.
     *
     * Performs two-stage validation:
     * 1. Validates against the configured create input schema
     * 2. Validates against Drizzle's insert schema for the table
     *
     * @param input - Raw input data to validate
     * @returns Validated data ready for database insertion
     * @throws AppErrors.validation if validation fails
     *
     * @example
     * ```ts
     * const validData = config.validateDataForTableInsert({
     *   data: { name: 'New Item' },
     *   userId: 'user-123'
     * });
     * // Returns: { name: 'New Item', userId: 'user-123', createdAt: Date, ... }
     * ```
     */
    validateDataForTableInsert(input: unknown): InferTableTypes<TTable, 'insert'> {
        // Stage 1: Validate against configured create input schema
        const configSchema = this.buildCreateInputSchema();
        const validatedInput = this.validateWithSchema(
            configSchema,
            input,
            'create input against configured schema'
        );

        // Stage 2: Extract and merge data + userId
        let insertData: Record<string, unknown> = {};

        if (
            'data' in validatedInput &&
            validatedInput.data &&
            typeof validatedInput.data === 'object'
        ) {
            insertData = { ...validatedInput.data };
        }

        if ('userId' in validatedInput && validatedInput.userId) {
            insertData.userId = validatedInput.userId;
        }

        // Stage 3: Validate against Drizzle's insert schema
        const insertSchema = createInsertSchema(this.config.table);
        const validatedData = this.validateWithSchema(
            insertSchema,
            insertData,
            'insert data against table schema'
        );

        return validatedData;
    }

    /**
     * Validate and transform input data for bulk table insert operations.
     *
     * Performs validation for createMany operations:
     * 1. Validates against the configured createMany input schema (with data array wrapper)
     * 2. Extracts data array and merges userId into each record
     * 3. Validates each record against Drizzle's insert schema
     *
     * @param input - Raw input containing { data: [...], userId?: ... }
     * @returns Array of validated data ready for database insertion
     * @throws AppErrors.validation if validation fails
     *
     * @example
     * ```ts
     * const validData = config.validateDataForTableInsertMany({
     *   data: [{ name: 'Item 1' }, { name: 'Item 2' }],
     *   userId: 'user-123'
     * });
     * // Returns: [{ name: 'Item 1', userId: 'user-123' }, { name: 'Item 2', userId: 'user-123' }]
     * ```
     */
    validateDataForTableInsertMany(input: unknown): Array<InferTableTypes<TTable, 'insert'>> {
        // Stage 1: Validate against configured createMany input schema
        const configSchema = this.buildCreateManyInputSchema();
        const validatedInput = this.validateWithSchema(
            configSchema,
            input,
            'createMany input against configured schema'
        );

        // Stage 2: Extract data array and merge userId into each record
        let dataArray: Array<Record<string, unknown>> = [];

        if ('data' in validatedInput && Array.isArray(validatedInput.data)) {
            const records: Array<Record<string, unknown>> = validatedInput.data;
            dataArray = records.map((item) => {
                const record = { ...item };
                if ('userId' in validatedInput && validatedInput.userId) {
                    record.userId = validatedInput.userId;
                }
                return record;
            });
        }

        // Stage 3: Validate each record against Drizzle's insert schema
        const insertSchema = createInsertSchema(this.config.table);
        const validatedArray = dataArray.map((record, index) => {
            return this.validateWithSchema(
                insertSchema,
                record,
                `insert data for record ${index} against table schema`
            );
        });

        return validatedArray;
    }

    // ========================================
    // Update
    // ========================================

    /**
     * Get the schema for updating records (data only).
     *
     * This schema represents the fields that can be updated on an existing record.
     * Typically all fields are optional (partial).
     */
    getUpdateDataSchema(): z.ZodObject<C['updateData']> {
        return z.object(this.config.updateData);
    }

    /**
     * Build a Zod schema for update operations.
     *
     * Combines update data schema with ID schema and user ID schema.
     * Used to validate input for updating existing records.
     *
     * @returns Zod schema containing { data: UpdateData, ids: {...}, userId?: string }
     *
     * @example
     * ```ts
     * const updateSchema = config.buildUpdateInputSchema();
     * const validated = updateSchema.parse({
     *   data: { name: 'Updated Name' },
     *   ids: { id: 'item-123' },
     *   userId: 'user-123'
     * });
     * ```
     */
    buildUpdateInputSchema() {
        return z.object({
            data: this.getUpdateDataSchema().partial(),
            ...this.buildIdentifierSchema().shape,
        });
    }

    /**
     * Validate and transform input data for table update operations.
     *
     * Performs two-stage validation:
     * 1. Validates against the configured update input schema (with data/ids/userId wrapper)
     * 2. Extracts the data portion and validates against Drizzle's update schema
     *
     * Note: Unlike insert, userId is NOT merged into update data - it's only used for
     * record identification/filtering. Only the `data` portion is validated and returned.
     *
     * @param input - Raw input containing { data: {...}, ids: {...}, userId?: ... }
     * @returns Validated partial data ready for database update
     * @throws AppErrors.validation if validation fails
     *
     * @example
     * ```ts
     * const validData = config.validateUpdateDataForTableUpdate({
     *   data: { name: 'Updated Name' },
     *   ids: { id: 'item-123' },
     *   userId: 'user-123'
     * });
     * // Returns: { name: 'Updated Name' }
     * ```
     */
    validateUpdateDataForTableUpdate(input: unknown): InferTableTypes<TTable, 'update'> {
        // Stage 1: Validate against configured update input schema
        const configSchema = this.buildUpdateInputSchema();
        const validatedInput = this.validateWithSchema(
            configSchema,
            input,
            'update input against configured schema'
        );

        // Stage 2: Extract just the data portion (userId/ids are for identification only)
        let updateData: Record<string, unknown> = {};

        if (
            'data' in validatedInput &&
            validatedInput.data &&
            typeof validatedInput.data === 'object'
        ) {
            updateData = { ...validatedInput.data };
        }

        // Stage 3: Validate against Drizzle's update schema
        const updateSchema = createUpdateSchema(this.config.table);
        const validatedData = this.validateWithSchema(
            updateSchema,
            updateData,
            'update data against table schema'
        );

        return validatedData;
    }

    // ========================================
    // Return Columns
    // ========================================

    /**
     * Get an array of column names that will be returned in queries.
     *
     * @returns Array of column keys from the select return schema
     *
     * @example
     * ```ts
     * const config = createFeatureTableConfig(tag)
     *   .defineReturnColumns(['id', 'name'])
     *   .build();
     *
     * const columns = config.getReturnColumns(); // ['id', 'name']
     * ```
     */
    getReturnColumns(): Array<Extract<keyof C['returnCols'], keyof TTable['_']['columns']>> {
        return getFieldsAsArrayConstrained(z.object(this.config.returnCols), this.config.table);
    }

    getReturnColumnsSchema(): z.ZodObject<C['returnCols']> {
        return z.object(this.config.returnCols);
    }

    // ========================================
    // User ID
    // ========================================

    /**
     * Get the name of the user ID field.
     *
     * Returns the field name configured via `.setUserId()`.
     *
     * @returns User ID field name, or undefined if no userId is configured
     *
     * @example
     * ```ts
     * const fieldName = config.getUserIdFieldName(); // 'userId' or undefined
     *
     * // Or with type guard:
     * if (config.hasUserId()) {
     *   const fieldName = config.getUserIdFieldName(); // 'userId'
     * }
     * ```
     */
    getUserIdFieldName(): keyof C['userId'] {
        const fields = getFieldsAsArray(z.object(this.config.userId));
        return fields[0];
    }

    /**
     * Get the user ID schema.
     */
    getUserIdSchema(): z.ZodObject<C['userId']> {
        return z.object(this.config.userId);
    }

    /**
     * Type guard: Check if user ID schema is configured (non-empty).
     */
    hasUserIdSchema(): this is FeatureTableConfig<TTable, C & { userId: TZodShape }> {
        return Object.keys(this.config.userId).length > 0;
    }

    // ========================================
    // ID fields
    // ========================================

    /**
     * Get the ID schema.
     */
    getIdSchema(): z.ZodObject<C['id']> {
        return z.object(this.config.id);
    }

    /**
     * Type guard: Check if ID schema is configured (non-empty).
     */
    hasIdSchema(): this is FeatureTableConfig<TTable, C & { id: TZodShape }> {
        return Object.keys(this.config.id).length > 0;
    }

    /**
     * Get the names of all ID fields.
     *
     * Returns an array of field names configured via `.setIds()`.
     * Useful for composite keys.
     *
     * @returns Array of ID field names, or undefined if no IDs are configured
     *
     * @example
     * ```ts
     * const idFields = config.getIdsFieldNames(); // ['id'] or undefined
     *
     * // Or with type guard:
     * if (config.hasIds()) {
     *   const idFields = config.getIdsFieldNames(); // ['id'] or ['tenantId', 'id']
     * }
     * ```
     */
    getIdsFieldNames(): Array<keyof C['id']> {
        const fields = getFieldsAsArray(z.object(this.config.id));
        return fields;
    }

    /**
     * Build a Zod schema for identifier-based operations (get, delete, etc.).
     *
     * Combines ID fields and user ID field into a single schema for operations
     * that need to identify specific records with user context.
     *
     * @returns Zod schema containing { ids: {...}, userId?: string }
     *
     * @example
     * ```ts
     * const identifierSchema = config.buildIdentifierSchema();
     * // Result: z.object({ ids: { id: z.string() }, userId: z.string() })
     * ```
     */
    buildIdentifierSchema() {
        const shape: TZodShape = {};

        // ids
        const idsSchema = z.object({
            ids: this.getIdSchema(),
        });
        if (this.hasIdSchema()) {
            Object.assign(shape, idsSchema.shape);
        }

        // userId
        if (this.hasUserIdSchema()) {
            Object.assign(shape, this.getUserIdSchema().shape);
        }

        return z.object(shape) as z.ZodObject<
            Prettify<ConditionalObjectShape<C['id'], (typeof idsSchema)['shape']> & C['userId']>
        >;
    }

    /**
     * @internal
     * Helper to validate input against a Zod schema with consistent error formatting.
     *
     * @param schema - Zod schema to validate against
     * @param input - Raw input to validate
     * @param context - Description of what's being validated (for error messages)
     * @returns Validated data
     * @throws AppErrors.validation with formatted error details
     */
    private validateWithSchema<T>(schema: z.ZodSchema<T>, input: unknown, context: string): T {
        const result = schema.safeParse(input);

        if (!result.success) {
            throw AppErrors.validation('INVALID_INPUT', {
                message: `Failed to validate ${context}`,
                details: {
                    zodErrors: result.error.issues,
                    context,
                },
            });
        }

        return result.data;
    }
}
