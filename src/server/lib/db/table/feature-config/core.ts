import { TZodShape } from '@/lib/schemas/types';
import { TZodType } from '@/lib/schemas_new/types';
import {
    getFieldsAsArray,
    getFieldsAsArrayConstrained,
    omitFields,
    pickFields,
} from '@/lib/utils/zod';
import { SystemTableFieldKeys } from '@/server/lib/db/table';
import {
    orderByDirectionSchema,
    orderingSchema,
    paginationSchema,
} from '@/server/lib/db/table/feature-config/schemas';
import {
    EmptySchema,
    InferDefaultSchemaForField,
    InferTableSchema,
    InferTableTypes,
} from '@/server/lib/db/table/feature-config/types';
import { getSchemaForTableField } from '@/server/lib/db/table/feature-config/utils';
import { fieldsToMask } from '@/server/lib/db/table/system-fields/utils';
import { AppErrors } from '@/server/lib/error';
import { Prettify } from '@/types/utils';
import { Table } from 'drizzle-orm';
import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-zod';
import z from 'zod';

/**
 * Final immutable configuration class for a feature table.
 *
 * Contains all Zod schemas and table reference needed for type-safe CRUD operations.
 * Created via FeatureTableConfigBuilder.build() - not instantiated directly.
 *
 * **Key Features:**
 * - All schemas are ZodObject (never undefined) for zero-assertion type safety
 * - Immutable - all properties are readonly
 * - Type guards (hasIds, hasUserId) for runtime type narrowing
 * - Helper methods to access schemas
 *
 * @example
 * ```ts
 * const config = createFeatureTableConfig(myTable)
 *   .setIds(['id'])
 *   .setUserId('userId')
 *   .build();
 *
 * // Access schemas directly via properties
 * const insertDataSchema = config.insertDataSchema;
 * const columns = config.getReturnColumns(); // ['id', 'name', ...]
 *
 * // Type guards
 * if (config.hasIds()) {
 *   // idSchema is guaranteed non-empty here
 * }
 * ```
 */
export class FeatureTableConfig<
    TTable extends Table = Table,
    TIdSchema extends TZodShape = EmptySchema,
    TUserIdSchema extends TZodShape = EmptySchema,
    TBase extends TZodShape = TZodShape,
    TInsertDataSchema extends TZodShape = TZodShape,
    TUpdateDataSchema extends TZodShape = TZodShape,
    TSelectReturnSchema extends TZodShape = TZodShape,
    TManyFiltersSchema extends TZodShape = EmptySchema,
    TPaginationSchema extends TZodShape = EmptySchema,
    TOrderingSchema extends TZodShape = EmptySchema,
> {
    /** The Drizzle table definition */
    readonly table: TTable;

    /** Schema for ID fields (empty if not configured via .setIds) */
    readonly idSchema: z.ZodObject<TIdSchema>;

    /** Schema for user ID field (empty if not configured via .setUserId) */
    readonly userIdSchema: z.ZodObject<TUserIdSchema>;

    /** Base schema - all available fields before restrictions */
    readonly baseSchema: z.ZodObject<TBase>;

    /** Schema for insert data operations (configurable via .restrictUpsertFields) */
    readonly insertDataSchema: z.ZodObject<TInsertDataSchema>;

    /** Schema for update data operations (partial, configurable via .restrictUpsertFields) */
    readonly updateDataSchema: z.ZodObject<TUpdateDataSchema>;

    /** Schema for select return operations (configurable via .restrictReturnColumns) */
    readonly selectReturnSchema: z.ZodObject<TSelectReturnSchema>;

    /** Schema for many filters operations (configurable via .enableManyFiltering) */
    readonly manyFiltersSchema: z.ZodObject<TManyFiltersSchema>;

    /** Schema for pagination operations (configurable via .enablePagination) */
    readonly paginationSchema: z.ZodObject<TPaginationSchema>;

    /** Schema for ordering operations (configurable via .enableOrdering) */
    readonly orderingSchema: z.ZodObject<TOrderingSchema>;

    /**
     * @internal
     * Constructor is private - use FeatureTableConfigBuilder.build() instead.
     */
    constructor(config: {
        table: TTable;
        idSchema: z.ZodObject<TIdSchema>;
        userIdSchema: z.ZodObject<TUserIdSchema>;
        baseSchema: z.ZodObject<TBase>;
        insertDataSchema: z.ZodObject<TInsertDataSchema>;
        updateDataSchema: z.ZodObject<TUpdateDataSchema>;
        selectReturnSchema: z.ZodObject<TSelectReturnSchema>;
        manyFiltersSchema: z.ZodObject<TManyFiltersSchema>;
        paginationSchema: z.ZodObject<TPaginationSchema>;
        orderingSchema: z.ZodObject<TOrderingSchema>;
    }) {
        this.table = config.table;
        this.idSchema = config.idSchema;
        this.userIdSchema = config.userIdSchema;
        this.baseSchema = config.baseSchema;
        this.insertDataSchema = config.insertDataSchema;
        this.updateDataSchema = config.updateDataSchema;
        this.selectReturnSchema = config.selectReturnSchema;
        this.manyFiltersSchema = config.manyFiltersSchema;
        this.paginationSchema = config.paginationSchema;
        this.orderingSchema = config.orderingSchema;
    }

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
    getUserIdFieldName(): keyof TUserIdSchema {
        const fields = getFieldsAsArray(this.userIdSchema);
        return fields[0];
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
    getIdsFieldNames(): Array<keyof TIdSchema> {
        const fields = getFieldsAsArray(this.idSchema);
        return fields;
    }

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
    getReturnColumns(): Array<Extract<keyof TSelectReturnSchema, keyof TTable['_']['columns']>> {
        return getFieldsAsArrayConstrained(this.selectReturnSchema, this.table);
    }

    /**
     * Type guard: Check if ID schema is configured (non-empty).
     *
     * After this check, TypeScript knows idSchema contains actual fields.
     *
     * @example
     * ```ts
     * if (config.hasIds()) {
     *   // TypeScript knows idSchema is non-empty
     *   const ids = config.idSchema; // ZodObject with ID fields
     * }
     * ```
     */
    hasIds(): this is FeatureTableConfig<
        TTable,
        Exclude<TIdSchema, EmptySchema>,
        TUserIdSchema,
        TBase,
        TInsertDataSchema,
        TUpdateDataSchema,
        TSelectReturnSchema,
        TManyFiltersSchema,
        TPaginationSchema,
        TOrderingSchema
    > {
        return Object.keys(this.idSchema.shape).length > 0;
    }

    /**
     * Type guard: Check if user ID schema is configured (non-empty).
     *
     * After this check, TypeScript knows userIdSchema contains a field.
     *
     * @example
     * ```ts
     * if (config.hasUserId()) {
     *   // TypeScript knows userIdSchema is non-empty
     *   const userId = config.userIdSchema; // ZodObject with userId field
     * }
     * ```
     */
    hasUserId(): this is FeatureTableConfig<
        TTable,
        TIdSchema,
        Exclude<TUserIdSchema, EmptySchema>,
        TBase,
        TInsertDataSchema,
        TUpdateDataSchema,
        TSelectReturnSchema,
        TManyFiltersSchema,
        TPaginationSchema,
        TOrderingSchema
    > {
        return Object.keys(this.userIdSchema.shape).length > 0;
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
    buildCreateInputSchema(): z.ZodObject<
        { data: z.ZodObject<TInsertDataSchema> } & TUserIdSchema
    > {
        return z.object({ data: this.insertDataSchema }).extend(this.userIdSchema.shape);
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
    buildCreateManyInputSchema(): z.ZodObject<
        { data: z.ZodArray<z.ZodObject<TInsertDataSchema>> } & TUserIdSchema
    > {
        return z.object({ data: z.array(this.insertDataSchema) }).extend(this.userIdSchema.shape);
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
    buildUpdateInputSchema(): z.ZodObject<
        {
            data: z.ZodObject<TUpdateDataSchema>;
            ids: z.ZodObject<TIdSchema>;
        } & TUserIdSchema
    > {
        return z.object({
            data: this.updateDataSchema,
            ...this.buildIdentifierSchema().shape,
        });
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
    buildIdentifierSchema(): z.ZodObject<{ ids: z.ZodObject<TIdSchema> } & TUserIdSchema> {
        return z
            .object({
                ids: this.idSchema,
            })
            .extend(this.userIdSchema.shape);
    }

    buildManyInputSchema(): z.ZodObject<
        Prettify<TUserIdSchema & TOrderingSchema & TManyFiltersSchema & TPaginationSchema>
    > {
        return z.object({
            ...this.manyFiltersSchema.shape,
            ...this.orderingSchema.shape,
            ...this.paginationSchema.shape,
            ...this.userIdSchema.shape,
        });
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
    validatePaginationInput(input: unknown): z.infer<typeof paginationSchema>['pagination'] {
        const validated = paginationSchema.safeParse(input);
        if (validated.success) {
            return validated.data.pagination;
        }
        return {
            page: undefined,
            pageSize: undefined,
        };
    }

    /**
     * Validate and normalize ordering input data.
     *
     * Attempts to parse the input using the ordering schema. If validation fails,
     * returns undefined.
     *
     * @param input - Raw input (should be an object containing a `ordering` key).
     *
     * @example
     * ```ts
     * config.validateOrderingInput({ ordering: [{ field: 'createdAt', direction: 'desc' }] });
     * // Returns: [{ field: 'createdAt', direction: 'desc' }]
     *
     * config.validateOrderingInput({});
     * // Returns: undefined
     * ```
     */
    validateOrderingInput(input: unknown): z.infer<ReturnType<typeof orderingSchema>>['ordering'] {
        const validated = orderingSchema(this.table).safeParse(input);
        if (validated.success) {
            return validated.data.ordering;
        }
        return undefined;
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
        const insertSchema = createInsertSchema(this.table);
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
        const insertSchema = createInsertSchema(this.table);
        const validatedArray = dataArray.map((record, index) => {
            return this.validateWithSchema(
                insertSchema,
                record,
                `insert data for record ${index} against table schema`
            );
        });

        return validatedArray;
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
        const updateSchema = createUpdateSchema(this.table);
        const validatedData = this.validateWithSchema(
            updateSchema,
            updateData,
            'update data against table schema'
        );

        return validatedData;
    }
}

/**
 * Builder for creating feature table configurations using a fluent API.
 *
 * Provides methods to configure:
 * - ID fields (.setIds)
 * - User ID field for row-level security (.setUserId)
 * - Which fields can be inserted/updated (.restrictUpsertFields)
 * - Which columns are returned in queries (.restrictReturnColumns)
 *
 * **Important:** Use the factory function `createFeatureTableConfig(table)` instead
 * of calling `FeatureTableConfigBuilder.create()` directly.
 *
 * @example
 * ```ts
 * import { createFeatureTableConfig } from '@/server/lib/db/table/feature-config';
 *
 * const config = createFeatureTableConfig(myTable)
 *   .setIds(['id'])              // Define primary key field(s)
 *   .setUserId('userId')         // Define user ID for RLS
 *   .restrictUpsertFields(['name', 'description']) // Limit insertable fields
 *   .restrictReturnColumns(['id', 'name'])         // Specify return columns
 *   .build();                    // Build immutable config
 * ```
 */
export class FeatureTableConfigBuilder<
    TTable extends Table,
    TBase extends TZodShape = InferTableSchema<TTable, 'insert'>['shape'],
    TInsertDataSchema extends TZodShape = TBase,
    TUpdateDataSchema extends TZodShape = TBase,
    TSelectReturnSchema extends TZodShape = InferTableSchema<TTable, 'select'>['shape'],
    TIdSchema extends TZodShape = EmptySchema,
    TUserIdSchema extends TZodShape = EmptySchema,
    TManyFiltersSchema extends TZodShape = EmptySchema,
    TPaginationSchema extends TZodShape = EmptySchema,
    TOrderingSchema extends TZodShape = EmptySchema,
> {
    private table: TTable;
    private idSchemaObj: z.ZodObject<TIdSchema>;
    private userIdSchemaObj: z.ZodObject<TUserIdSchema>;
    private baseSchemaObj: z.ZodObject<TBase>;
    private insertDataSchemaObj: z.ZodObject<TInsertDataSchema>;
    private updateDataSchemaObj: z.ZodObject<TUpdateDataSchema>;
    private selectReturnSchemaObj: z.ZodObject<TSelectReturnSchema>;
    private manyFiltersSchemaObj: z.ZodObject<TManyFiltersSchema>;
    private paginationSchemaObj: z.ZodObject<TPaginationSchema>;
    private orderingSchemaObj: z.ZodObject<TOrderingSchema>;

    /**
     * @internal
     * Private constructor - only called by static create() and builder methods.
     * All assignments are type-safe with zero assertions!
     */
    private constructor(config: {
        table: TTable;
        idSchemaObj: z.ZodObject<TIdSchema>;
        userIdSchemaObj: z.ZodObject<TUserIdSchema>;
        baseSchemaObj: z.ZodObject<TBase>;
        insertDataSchemaObj: z.ZodObject<TInsertDataSchema>;
        updateDataSchemaObj: z.ZodObject<TUpdateDataSchema>;
        selectReturnSchemaObj: z.ZodObject<TSelectReturnSchema>;
        manyFiltersSchemaObj: z.ZodObject<TManyFiltersSchema>;
        paginationSchemaObj: z.ZodObject<TPaginationSchema>;
        orderingSchemaObj: z.ZodObject<TOrderingSchema>;
    }) {
        this.table = config.table;
        this.idSchemaObj = config.idSchemaObj;
        this.userIdSchemaObj = config.userIdSchemaObj;
        this.baseSchemaObj = config.baseSchemaObj;
        this.insertDataSchemaObj = config.insertDataSchemaObj;
        this.updateDataSchemaObj = config.updateDataSchemaObj;
        this.selectReturnSchemaObj = config.selectReturnSchemaObj;
        this.manyFiltersSchemaObj = config.manyFiltersSchemaObj;
        this.paginationSchemaObj = config.paginationSchemaObj;
        this.orderingSchemaObj = config.orderingSchemaObj;
    }

    /**
     * Create a new builder instance for a Drizzle table.
     *
     * @internal Use `createFeatureTableConfig(table)` factory instead.
     *
     * Initializes with:
     * - Empty ID and user ID schemas
     * - All table fields available for insert/update
     * - All table columns available for select
     */
    static create<TTable extends Table>(table: TTable) {
        const baseSchemaObj = createInsertSchema(table).omit(fieldsToMask());

        const idSchema = getSchemaForTableField(table, 'id');
        const userSchema = getSchemaForTableField(table, 'userId');

        return new FeatureTableConfigBuilder<
            TTable,
            Prettify<Omit<InferTableSchema<TTable, 'insert'>['shape'], SystemTableFieldKeys>>,
            Prettify<Omit<InferTableSchema<TTable, 'insert'>['shape'], SystemTableFieldKeys>>,
            Prettify<Omit<InferTableSchema<TTable, 'update'>['shape'], SystemTableFieldKeys>>,
            InferTableSchema<TTable, 'select'>['shape'],
            InferDefaultSchemaForField<TTable, 'id'>['shape'],
            InferDefaultSchemaForField<TTable, 'userId'>['shape'],
            EmptySchema,
            EmptySchema,
            EmptySchema
        >({
            table,
            idSchemaObj: idSchema,
            userIdSchemaObj: userSchema,
            baseSchemaObj: baseSchemaObj,
            insertDataSchemaObj: baseSchemaObj,
            updateDataSchemaObj: createUpdateSchema(table).omit(fieldsToMask()),
            selectReturnSchemaObj: z.object(createSelectSchema(table).shape),
            manyFiltersSchemaObj: z.object({}),
            paginationSchemaObj: z.object({}),
            orderingSchemaObj: z.object({}),
        });
    }

    /**
     * Get the raw Zod shape object for the table's schema, used to generate schema definitions for
     * insert, select, or update operations.
     *
     * - 'insert': The shape representing all fields required or optional for creation.
     * - 'select': The shape of all possible fields returned by a select query.
     * - 'update': The shape of all fields that can be updated.
     *
     * Used internally for programmatic schema manipulation and type inference.
     *
     * @param type - The schema operation type ('insert', 'select', or 'update'). Defaults to 'insert'.
     * @returns The raw Zod shape object for the specified operation type.
     */
    private getRawSchemaFromTable(type: 'insert'): InferTableSchema<TTable, 'insert'>['shape'];
    private getRawSchemaFromTable(type: 'select'): InferTableSchema<TTable, 'select'>['shape'];
    private getRawSchemaFromTable(type: 'update'): InferTableSchema<TTable, 'update'>['shape'];
    private getRawSchemaFromTable(
        type: 'insert' | 'select' | 'update' = 'insert'
    ):
        | InferTableSchema<TTable, 'insert'>['shape']
        | InferTableSchema<TTable, 'select'>['shape']
        | InferTableSchema<TTable, 'update'>['shape'] {
        if (type === 'insert') {
            return createInsertSchema(this.table).shape;
        }
        if (type === 'select') {
            return createSelectSchema(this.table).shape;
        }
        if (type === 'update') {
            return createUpdateSchema(this.table).shape;
        }
        // Default to insert shape if somehow invalid type (should not occur with union type param)
        return createInsertSchema(this.table).shape;
    }

    /**
     * Allow all fields for insert and update operations, inlcuding system fields such as `userId`, `createdAt`, `updatedAt`, etc.
     *
     * Resets any field restrictions set via `.restrictUpsertFields()`, `.restrictInsertFields()`,
     * or `.restrictUpdateFields()`.
     *
     * **Warning:** This overwrites previously specified insert/update schemas.
     *
     * @example
     * ```ts
     * const config = createFeatureTableConfig(table)
     *   .restrictUpsertFields(['name'])  // Restrict to name only
     *   .allowAllFields()                // Now allow all fields again
     *   .build();
     * ```
     */
    allowAllFields() {
        const createSchema = createInsertSchema(this.table);
        const updateSchema = createUpdateSchema(this.table);

        return new FeatureTableConfigBuilder<
            TTable,
            InferTableSchema<TTable, 'insert'>['shape'],
            InferTableSchema<TTable, 'insert'>['shape'],
            InferTableSchema<TTable, 'update'>['shape'],
            TSelectReturnSchema,
            TIdSchema,
            TUserIdSchema,
            TManyFiltersSchema,
            TPaginationSchema,
            TOrderingSchema
        >({
            table: this.table,
            idSchemaObj: this.idSchemaObj,
            userIdSchemaObj: this.userIdSchemaObj,
            baseSchemaObj: createSchema,
            insertDataSchemaObj: createSchema,
            updateDataSchemaObj: updateSchema,
            selectReturnSchemaObj: this.selectReturnSchemaObj,
            manyFiltersSchemaObj: this.manyFiltersSchemaObj,
            paginationSchemaObj: this.paginationSchemaObj,
            orderingSchemaObj: this.orderingSchemaObj,
        });
    }

    /**
     * Define which field(s) are used as primary keys.
     *
     * Used for operations like getById, deleteById, etc.
     * Supports composite keys by passing multiple fields.
     *
     * @param fields - Array of column names that form the primary key
     * @returns New builder instance with ID schema configured
     * @throws Error if fields array is empty
     *
     * @example
     * ```ts
     * // Single ID field
     * const config = createFeatureTableConfig(table)
     *   .setIds(['id'])
     *   .build();
     *
     * // Composite key
     * const config = createFeatureTableConfig(table)
     *   .setIds(['tenantId', 'id'])
     *   .build();
     * ```
     */
    setIds<const TFields extends (keyof InferTableSchema<TTable, 'select'>['shape'])[]>(
        fields: TFields
    ) {
        if (fields.length === 0) {
            throw new Error(
                `[FeatureTableConfigBuilder] setIds: must provide at least one ID field`
            );
        }

        const idSchemaObj = pickFields(
            z.object(this.getRawSchemaFromTable('select')),
            fields
        ).required();

        return new FeatureTableConfigBuilder<
            TTable,
            TBase,
            TInsertDataSchema,
            TUpdateDataSchema,
            TSelectReturnSchema,
            typeof idSchemaObj.shape,
            TUserIdSchema,
            TManyFiltersSchema,
            TPaginationSchema,
            TOrderingSchema
        >({
            table: this.table,
            idSchemaObj,
            userIdSchemaObj: this.userIdSchemaObj,
            baseSchemaObj: this.baseSchemaObj,
            insertDataSchemaObj: this.insertDataSchemaObj,
            updateDataSchemaObj: this.updateDataSchemaObj,
            selectReturnSchemaObj: this.selectReturnSchemaObj,
            manyFiltersSchemaObj: this.manyFiltersSchemaObj,
            paginationSchemaObj: this.paginationSchemaObj,
            orderingSchemaObj: this.orderingSchemaObj,
        });
    }

    /**
     * Remove ID schema configuration.
     *
     * Clears any ID fields previously set via `.setIds()`.
     * Use this when you need to reconfigure IDs or when IDs aren't needed.
     *
     * @returns New builder instance with empty ID schema
     *
     * @example
     * ```ts
     * const config = createFeatureTableConfig(table)
     *   .setIds(['id'])      // Set ID
     *   .removeIds()         // Remove it
     *   .setIds(['newId'])   // Set a different ID
     *   .build();
     * ```
     */
    removeIds() {
        type NewIdSchema = EmptySchema;

        return new FeatureTableConfigBuilder<
            TTable,
            TBase,
            TInsertDataSchema,
            TUpdateDataSchema,
            TSelectReturnSchema,
            NewIdSchema,
            TUserIdSchema,
            TManyFiltersSchema,
            TPaginationSchema,
            TOrderingSchema
        >({
            table: this.table,
            idSchemaObj: z.object({}),
            userIdSchemaObj: this.userIdSchemaObj,
            baseSchemaObj: this.baseSchemaObj,
            insertDataSchemaObj: this.insertDataSchemaObj,
            updateDataSchemaObj: this.updateDataSchemaObj,
            selectReturnSchemaObj: this.selectReturnSchemaObj,
            manyFiltersSchemaObj: this.manyFiltersSchemaObj,
            paginationSchemaObj: this.paginationSchemaObj,
            orderingSchemaObj: this.orderingSchemaObj,
        });
    }

    /**
     * Define which field contains the user ID for row-level security (RLS).
     *
     * This field will be automatically used to filter queries so users only
     * see/modify their own data.
     *
     * @param field - Column name containing the user/owner ID
     * @returns New builder instance with user ID schema configured
     *
     * @example
     * ```ts
     * const config = createFeatureTableConfig(table)
     *   .setUserId('userId')
     *   .build();
     *
     * // Now queries will automatically filter by userId
     * // e.g., WHERE userId = currentUser.id
     * ```
     */
    setUserId<const TField extends keyof InferTableSchema<TTable, 'select'>['shape']>(
        field: TField
    ) {
        const userIdSchemaObj = pickFields(z.object(this.getRawSchemaFromTable('select')), [
            field,
        ]).required();

        type NewUserIdSchema = typeof userIdSchemaObj.shape;

        return new FeatureTableConfigBuilder<
            TTable,
            TBase,
            TInsertDataSchema,
            TUpdateDataSchema,
            TSelectReturnSchema,
            TIdSchema,
            NewUserIdSchema,
            TManyFiltersSchema,
            TPaginationSchema,
            TOrderingSchema
        >({
            table: this.table,
            idSchemaObj: this.idSchemaObj,
            userIdSchemaObj,
            baseSchemaObj: this.baseSchemaObj,
            insertDataSchemaObj: this.insertDataSchemaObj,
            updateDataSchemaObj: this.updateDataSchemaObj,
            selectReturnSchemaObj: this.selectReturnSchemaObj,
            manyFiltersSchemaObj: this.manyFiltersSchemaObj,
            paginationSchemaObj: this.paginationSchemaObj,
            orderingSchemaObj: this.orderingSchemaObj,
        });
    }

    /**
     * Remove user ID schema configuration.
     *
     * Clears any user ID field previously set via `.setUserId()`.
     * Use this when you need to reconfigure the user ID field or when RLS isn't needed.
     *
     * @returns New builder instance with empty user ID schema
     *
     * @example
     * ```ts
     * const config = createFeatureTableConfig(table)
     *   .setUserId('userId')         // Set user ID
     *   .removeUserId()              // Remove it
     *   .setUserId('ownerId')        // Set a different field
     *   .build();
     * ```
     */
    removeUserId() {
        type NewUserIdSchema = EmptySchema;

        return new FeatureTableConfigBuilder<
            TTable,
            TBase,
            TInsertDataSchema,
            TUpdateDataSchema,
            TSelectReturnSchema,
            TIdSchema,
            NewUserIdSchema,
            TManyFiltersSchema,
            TPaginationSchema,
            TOrderingSchema
        >({
            table: this.table,
            idSchemaObj: this.idSchemaObj,
            userIdSchemaObj: z.object({}),
            baseSchemaObj: this.baseSchemaObj,
            insertDataSchemaObj: this.insertDataSchemaObj,
            updateDataSchemaObj: this.updateDataSchemaObj,
            selectReturnSchemaObj: this.selectReturnSchemaObj,
            manyFiltersSchemaObj: this.manyFiltersSchemaObj,
            paginationSchemaObj: this.paginationSchemaObj,
            orderingSchemaObj: this.orderingSchemaObj,
        });
    }

    /**
     * Restrict which fields can be inserted/updated (upsert operations).
     *
     * Restricts both insert and update operations to only the specified fields.
     * Also updates the base schema to match. Use this when you want the same
     * fields for both insert and update.
     *
     * @param fields - Array of field names allowed for upsert
     * @returns New builder instance with restricted schemas
     *
     * @example
     * ```ts
     * const config = createFeatureTableConfig(table)
     *   .restrictUpsertFields(['name', 'description', 'color'])
     *   .build();
     *
     * // Users can only insert/update name, description, color
     * // Fields like id, createdAt, etc. are protected
     * ```
     */
    restrictUpsertFields<const TFields extends (keyof TBase)[]>(fields: TFields) {
        const baseSchemaObj = pickFields(this.baseSchemaObj, fields);

        return new FeatureTableConfigBuilder<
            TTable,
            typeof baseSchemaObj.shape,
            typeof baseSchemaObj.shape,
            typeof baseSchemaObj.shape,
            TSelectReturnSchema,
            TIdSchema,
            TUserIdSchema,
            TManyFiltersSchema,
            TPaginationSchema,
            TOrderingSchema
        >({
            table: this.table,
            baseSchemaObj,
            idSchemaObj: this.idSchemaObj,
            userIdSchemaObj: this.userIdSchemaObj,
            insertDataSchemaObj: baseSchemaObj,
            updateDataSchemaObj: baseSchemaObj,
            selectReturnSchemaObj: this.selectReturnSchemaObj,
            manyFiltersSchemaObj: this.manyFiltersSchemaObj,
            paginationSchemaObj: this.paginationSchemaObj,
            orderingSchemaObj: this.orderingSchemaObj,
        });
    }

    /**
     * Restrict which fields are allowed for insert operations only.
     *
     * Use this when insert fields differ from update fields.
     * For same fields in both, use `.restrictUpsertFields()` instead.
     *
     * @param fields - Array of field names allowed for inserts
     * @returns New builder instance with restricted insert schema
     *
     * @example
     * ```ts
     * const config = createFeatureTableConfig(table)
     *   .restrictInsertFields(['name', 'email', 'role'])
     *   .restrictUpdateFields(['name', 'email'])  // role can't be updated
     *   .build();
     * ```
     */
    restrictInsertFields<const TFields extends (keyof TBase)[]>(fields: TFields) {
        const insertDataSchemaObj = pickFields(this.baseSchemaObj, fields);

        return new FeatureTableConfigBuilder<
            TTable,
            TBase,
            typeof insertDataSchemaObj.shape,
            TUpdateDataSchema,
            TSelectReturnSchema,
            TIdSchema,
            TUserIdSchema,
            TManyFiltersSchema,
            TPaginationSchema,
            TOrderingSchema
        >({
            table: this.table,
            baseSchemaObj: this.baseSchemaObj,
            idSchemaObj: this.idSchemaObj,
            userIdSchemaObj: this.userIdSchemaObj,
            insertDataSchemaObj,
            updateDataSchemaObj: this.updateDataSchemaObj,
            selectReturnSchemaObj: this.selectReturnSchemaObj,
            manyFiltersSchemaObj: this.manyFiltersSchemaObj,
            paginationSchemaObj: this.paginationSchemaObj,
            orderingSchemaObj: this.orderingSchemaObj,
        });
    }

    /**
     * Restrict which fields are allowed for update operations only.
     *
     * The resulting schema is automatically partial (all fields optional).
     * Use this when update fields differ from insert fields.
     *
     * @param fields - Array of field names allowed for updates
     * @returns New builder instance with restricted update schema
     *
     * @example
     * ```ts
     * const config = createFeatureTableConfig(table)
     *   .restrictInsertFields(['name', 'email', 'role'])
     *   .restrictUpdateFields(['name', 'email'])  // can't update role
     *   .build();
     *
     * // Update schema will be: { name?: string; email?: string }
     * ```
     */
    restrictUpdateFields<const TFields extends (keyof TBase)[]>(fields: TFields) {
        const updateDataSchemaObj = pickFields(this.baseSchemaObj, fields).partial();

        return new FeatureTableConfigBuilder<
            TTable,
            TBase,
            TInsertDataSchema,
            typeof updateDataSchemaObj.shape,
            TSelectReturnSchema,
            TIdSchema,
            TUserIdSchema,
            TManyFiltersSchema,
            TPaginationSchema,
            TOrderingSchema
        >({
            table: this.table,
            baseSchemaObj: this.baseSchemaObj,
            idSchemaObj: this.idSchemaObj,
            userIdSchemaObj: this.userIdSchemaObj,
            insertDataSchemaObj: this.insertDataSchemaObj,
            updateDataSchemaObj,
            selectReturnSchemaObj: this.selectReturnSchemaObj,
            manyFiltersSchemaObj: this.manyFiltersSchemaObj,
            paginationSchemaObj: this.paginationSchemaObj,
            orderingSchemaObj: this.orderingSchemaObj,
        });
    }

    /**
     * Restrict which columns should be returned in query results.
     *
     * Restricts select operations to only return the specified columns.
     * Useful for excluding sensitive fields or optimizing query performance.
     *
     * @param fields - Array of column names to include in results
     * @returns New builder instance with restricted select schema
     * @throws Error if fields array is empty or contains duplicates
     *
     * @example
     * ```ts
     * const config = createFeatureTableConfig(userTable)
     *   .restrictReturnColumns(['id', 'name', 'email'])
     *   .build();
     *
     * // Query results will only include: { id, name, email }
     * // password, createdAt, etc. won't be returned
     * ```
     */
    restrictReturnColumns<
        const TFields extends (keyof InferTableSchema<TTable, 'select'>['shape'])[],
    >(fields: TFields) {
        if (fields.length === 0) {
            throw new Error(
                `[FeatureTableConfigBuilder] restrictReturnColumns: must provide at least one column`
            );
        }

        // Check for duplicates
        const uniqueFields = new Set(fields);
        if (uniqueFields.size !== fields.length) {
            throw new Error(
                `[FeatureTableConfigBuilder] restrictReturnColumns: duplicate columns detected`
            );
        }

        const selectReturnSchemaObj = pickFields(
            z.object(this.getRawSchemaFromTable('select')),
            fields
        ).required();

        return new FeatureTableConfigBuilder<
            TTable,
            TBase,
            TInsertDataSchema,
            TUpdateDataSchema,
            typeof selectReturnSchemaObj.shape,
            TIdSchema,
            TUserIdSchema,
            TManyFiltersSchema,
            TPaginationSchema,
            TOrderingSchema
        >({
            table: this.table,
            baseSchemaObj: this.baseSchemaObj,
            idSchemaObj: this.idSchemaObj,
            userIdSchemaObj: this.userIdSchemaObj,
            insertDataSchemaObj: this.insertDataSchemaObj,
            updateDataSchemaObj: this.updateDataSchemaObj,
            selectReturnSchemaObj,
            manyFiltersSchemaObj: this.manyFiltersSchemaObj,
            paginationSchemaObj: this.paginationSchemaObj,
            orderingSchemaObj: this.orderingSchemaObj,
        });
    }

    /**
     * Pick specific fields for the base schema.
     *
     * Restricts the base schema to only the specified fields. This affects what
     * fields are available for subsequent `.restrictUpsertFields()` calls.
     *
     * **Note:** This only affects the base schema, not insert/update/select schemas directly.
     * Use this before calling `.restrictUpsertFields()` to limit available fields.
     *
     * @param fields - Array of field names to keep
     * @returns New builder instance with restricted base schema
     *
     * @example
     * ```ts
     * const config = createFeatureTableConfig(table)
     *   .pickBaseSchema(['name', 'description', 'color'])
     *   .restrictUpsertFields(['name', 'color']) // Can only pick from picked fields
     *   .build();
     * ```
     */
    pickBaseSchema<const TFields extends (keyof TBase)[]>(fields: TFields) {
        const baseSchemaObj = pickFields(this.baseSchemaObj, fields);

        return new FeatureTableConfigBuilder<
            TTable,
            typeof baseSchemaObj.shape,
            TInsertDataSchema,
            TUpdateDataSchema,
            TSelectReturnSchema,
            TIdSchema,
            TUserIdSchema,
            TManyFiltersSchema,
            TPaginationSchema,
            TOrderingSchema
        >({
            table: this.table,
            baseSchemaObj: baseSchemaObj,
            idSchemaObj: this.idSchemaObj,
            userIdSchemaObj: this.userIdSchemaObj,
            insertDataSchemaObj: this.insertDataSchemaObj,
            updateDataSchemaObj: this.updateDataSchemaObj,
            selectReturnSchemaObj: this.selectReturnSchemaObj,
            manyFiltersSchemaObj: this.manyFiltersSchemaObj,
            paginationSchemaObj: this.paginationSchemaObj,
            orderingSchemaObj: this.orderingSchemaObj,
        });
    }

    /**
     * Omit specific fields from the base schema.
     *
     * Excludes the specified fields from the base schema. This affects what
     * fields are available for subsequent `.restrictUpsertFields()` calls.
     *
     * **Note:** This also updates insert and update schemas to match the new base schema.
     *
     * @param fields - Array of field names to exclude
     * @returns New builder instance with restricted base schema
     *
     * @example
     * ```ts
     * const config = createFeatureTableConfig(table)
     *   .omitBaseSchema(['internalField', 'systemField'])
     *   .restrictUpsertFields(['name', 'description']) // Omitted fields not available
     *   .build();
     * ```
     */
    omitBaseSchema<const TFields extends (keyof TBase)[]>(fields: TFields) {
        const baseSchemaObj = omitFields(this.baseSchemaObj, fields);

        return new FeatureTableConfigBuilder<
            TTable,
            typeof baseSchemaObj.shape,
            typeof baseSchemaObj.shape,
            typeof baseSchemaObj.shape,
            TSelectReturnSchema,
            TIdSchema,
            TUserIdSchema,
            TManyFiltersSchema,
            TPaginationSchema,
            TOrderingSchema
        >({
            table: this.table,
            baseSchemaObj: baseSchemaObj,
            idSchemaObj: this.idSchemaObj,
            userIdSchemaObj: this.userIdSchemaObj,
            insertDataSchemaObj: baseSchemaObj,
            updateDataSchemaObj: baseSchemaObj,
            selectReturnSchemaObj: this.selectReturnSchemaObj,
            manyFiltersSchemaObj: this.manyFiltersSchemaObj,
            paginationSchemaObj: this.paginationSchemaObj,
            orderingSchemaObj: this.orderingSchemaObj,
        });
    }

    /**
     * Define filter schema for querying multiple records.
     *
     * Allows you to specify Zod schemas for filtering operations. You can define
     * filters for any subset of table columns - not all columns need to be included.
     *
     * @param schema - Partial record mapping column names to Zod validation schemas
     * @returns New builder instance with filter schema configured
     *
     * @example
     * ```ts
     * const config = createFeatureTableConfig(table)
     *   .enableManyFiltering({
     *     name: z.string(),           // Filter by name
     *     createdAt: z.date(),        // Filter by creation date
     *     status: z.enum(['active'])  // Filter by status
     *   })
     *   .build();
     *
     * // Only these fields can be used as filters, not all table columns
     * ```
     */
    enableManyFiltering<
        const TSchema extends Partial<Record<keyof TTable['_']['columns'], TZodType>> &
            Record<string, TZodType>,
    >(schema: TSchema) {
        const manyFiltersSchemaObj = z.object({ filters: z.object(schema).partial().optional() });

        return new FeatureTableConfigBuilder<
            TTable,
            TBase,
            TInsertDataSchema,
            TUpdateDataSchema,
            TSelectReturnSchema,
            TIdSchema,
            TUserIdSchema,
            typeof manyFiltersSchemaObj.shape,
            TPaginationSchema,
            TOrderingSchema
        >({
            table: this.table,
            baseSchemaObj: this.baseSchemaObj,
            idSchemaObj: this.idSchemaObj,
            userIdSchemaObj: this.userIdSchemaObj,
            insertDataSchemaObj: this.insertDataSchemaObj,
            updateDataSchemaObj: this.updateDataSchemaObj,
            selectReturnSchemaObj: this.selectReturnSchemaObj,
            manyFiltersSchemaObj: manyFiltersSchemaObj,
            paginationSchemaObj: this.paginationSchemaObj,
            orderingSchemaObj: this.orderingSchemaObj,
        });
    }

    /**
     * Enable pagination for this table.
     *
     * Adds `page` and `pageSize` fields to the query schema.
     *
     * @param config - Configuration for pagination defaults
     * @returns New builder instance with pagination schema configured
     */
    enablePagination() {
        return new FeatureTableConfigBuilder<
            TTable,
            TBase,
            TInsertDataSchema,
            TUpdateDataSchema,
            TSelectReturnSchema,
            TIdSchema,
            TUserIdSchema,
            TManyFiltersSchema,
            typeof paginationSchema.shape,
            TOrderingSchema
        >({
            table: this.table,
            baseSchemaObj: this.baseSchemaObj,
            idSchemaObj: this.idSchemaObj,
            userIdSchemaObj: this.userIdSchemaObj,
            insertDataSchemaObj: this.insertDataSchemaObj,
            updateDataSchemaObj: this.updateDataSchemaObj,
            selectReturnSchemaObj: this.selectReturnSchemaObj,
            manyFiltersSchemaObj: this.manyFiltersSchemaObj,
            paginationSchemaObj: paginationSchema,
            orderingSchemaObj: this.orderingSchemaObj,
        });
    }

    /**
     * Enable ordering for this table.
     *
     * Creates a Zod schema where each provided column is a key with `z.enum(['asc', 'desc'])` as the value.
     * This allows ordering by any of the specified columns with ascending or descending direction.
     *
     * @param columns - Array of table column names that can be used for ordering
     * @returns New builder instance with ordering schema configured
     *
     * @example
     * ```ts
     * const config = createFeatureTableConfig(table)
     *   .enableOrdering(['name', 'createdAt', 'updatedAt'])
     *   .build();
     *
     * // Resulting schema: {
     * //   name: z.enum(['asc', 'desc']),
     * //   createdAt: z.enum(['asc', 'desc']),
     * //   updatedAt: z.enum(['asc', 'desc'])
     * // }
     * ```
     */
    enableOrdering<
        const TColumns extends Array<keyof TTable['_']['columns'] & string> = Array<
            keyof TTable['_']['columns'] & string
        >,
    >(columns: TColumns) {
        const orderingShape = z
            .array(
                z.object({
                    field: z.enum(columns),
                    direction: orderByDirectionSchema,
                })
            )
            .optional();

        const orderingSchema = z.object({
            ordering: orderingShape,
        });

        return new FeatureTableConfigBuilder<
            TTable,
            TBase,
            TInsertDataSchema,
            TUpdateDataSchema,
            TSelectReturnSchema,
            TIdSchema,
            TUserIdSchema,
            TManyFiltersSchema,
            TPaginationSchema,
            typeof orderingSchema.shape
        >({
            table: this.table,
            baseSchemaObj: this.baseSchemaObj,
            idSchemaObj: this.idSchemaObj,
            userIdSchemaObj: this.userIdSchemaObj,
            insertDataSchemaObj: this.insertDataSchemaObj,
            updateDataSchemaObj: this.updateDataSchemaObj,
            selectReturnSchemaObj: this.selectReturnSchemaObj,
            manyFiltersSchemaObj: this.manyFiltersSchemaObj,
            paginationSchemaObj: this.paginationSchemaObj,
            orderingSchemaObj: orderingSchema,
        });
    }

    /**
     * Build the final immutable configuration object.
     *
     * Creates a FeatureTableConfig instance with all configured schemas.
     * This is the final step in the builder chain - returns an immutable config
     * that can be passed to query builders, services, and other utilities.
     *
     * **Note:** This method logs warnings if common configurations (IDs, userId) are missing.
     * Set appropriate values or explicitly remove them to suppress warnings.
     *
     * @returns Immutable FeatureTableConfig with all schemas finalized
     *
     * @example
     * ```ts
     * const config = createFeatureTableConfig(table)
     *   .setIds(['id'])
     *   .setUserId('userId')
     *   .restrictUpsertFields(['name', 'description'])
     *   .build();  // Final step - creates immutable config
     *
     * // Now use config with query builders, services, etc.
     * const query = createFeatureQuery(config);
     * ```
     */
    build(): FeatureTableConfig<
        TTable,
        TIdSchema,
        TUserIdSchema,
        TBase,
        TInsertDataSchema,
        TUpdateDataSchema,
        TSelectReturnSchema,
        TManyFiltersSchema,
        TPaginationSchema,
        TOrderingSchema
    > {
        return new FeatureTableConfig({
            table: this.table,
            idSchema: this.idSchemaObj,
            userIdSchema: this.userIdSchemaObj,
            baseSchema: this.baseSchemaObj,
            insertDataSchema: this.insertDataSchemaObj,
            updateDataSchema: this.updateDataSchemaObj,
            selectReturnSchema: this.selectReturnSchemaObj,
            manyFiltersSchema: this.manyFiltersSchemaObj,
            paginationSchema: this.paginationSchemaObj,
            orderingSchema: this.orderingSchemaObj,
        });
    }
}
