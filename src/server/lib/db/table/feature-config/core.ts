import { TZodShape } from '@/lib/schemas/types';
import { typedKeys } from '@/lib/utils';
import { EmptySchema, InferTableSchema } from '@/server/lib/db/table/feature-config/types';
import { pickFields } from '@/server/lib/db/table/table-config';
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
 * // Access schemas
 * const insertSchema = config.getInsertSchema();
 * const columns = config.getReturnColumns(); // ['id', 'name', ...]
 *
 * // Type guards
 * if (config.hasIds()) {
 *   // idSchema is guaranteed non-empty here
 * }
 * ```
 */
export class FeatureTableConfig<
    TTable extends Table,
    TIdSchema extends TZodShape = EmptySchema,
    TUserIdSchema extends TZodShape = EmptySchema,
    TBase extends TZodShape = InferTableSchema<TTable, 'insert'>['shape'],
    TInsertSchema extends TZodShape = InferTableSchema<TTable, 'insert'>['shape'],
    TUpdateSchema extends TZodShape = InferTableSchema<TTable, 'update'>['shape'],
    TSelectSchema extends TZodShape = InferTableSchema<TTable, 'select'>['shape'],
> {
    /** The Drizzle table definition */
    readonly table: TTable;

    /** Schema for ID fields (empty if not configured via .setIds) */
    readonly idSchema: z.ZodObject<TIdSchema>;

    /** Schema for user ID field (empty if not configured via .setUserId) */
    readonly userIdSchema: z.ZodObject<TUserIdSchema>;

    /** Base schema - all available fields before restrictions */
    readonly baseSchema: z.ZodObject<TBase>;

    /** Schema for insert operations (configurable via .defineUpsertData) */
    readonly insertSchema: z.ZodObject<TInsertSchema>;

    /** Schema for update operations (partial, configurable via .defineUpsertData) */
    readonly updateSchema: z.ZodObject<TUpdateSchema>;

    /** Schema for select operations (configurable via .defineReturnColumns) */
    readonly selectSchema: z.ZodObject<TSelectSchema>;

    /**
     * @internal
     * Constructor is private - use FeatureTableConfigBuilder.build() instead.
     */
    constructor(config: {
        table: TTable;
        idSchema: z.ZodObject<TIdSchema>;
        userIdSchema: z.ZodObject<TUserIdSchema>;
        baseSchema: z.ZodObject<TBase>;
        insertSchema: z.ZodObject<TInsertSchema>;
        updateSchema: z.ZodObject<TUpdateSchema>;
        selectSchema: z.ZodObject<TSelectSchema>;
    }) {
        this.table = config.table;
        this.idSchema = config.idSchema;
        this.userIdSchema = config.userIdSchema;
        this.baseSchema = config.baseSchema;
        this.insertSchema = config.insertSchema;
        this.updateSchema = config.updateSchema;
        this.selectSchema = config.selectSchema;
    }

    /** Get the base Zod schema containing all available fields */
    getBaseSchema(): z.ZodObject<TBase> {
        return this.baseSchema;
    }

    /** Get the Zod schema for insert operations */
    getInsertSchema(): z.ZodObject<TInsertSchema> {
        return this.insertSchema;
    }

    /** Get the Zod schema for update operations (partial) */
    getUpdateSchema(): z.ZodObject<TUpdateSchema> {
        return this.updateSchema;
    }

    /** Get the Zod schema for select operations */
    getSelectSchema(): z.ZodObject<TSelectSchema> {
        return this.selectSchema;
    }

    /**
     * Get an array of column names that will be returned in queries.
     *
     * @returns Array of column keys from the select schema
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
    getReturnColumns(): Array<keyof z.infer<z.ZodObject<TSelectSchema>>> {
        return typedKeys(this.selectSchema.shape) as Array<
            keyof z.infer<z.ZodObject<TSelectSchema>>
        >;
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
        TInsertSchema,
        TUpdateSchema,
        TSelectSchema
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
        TInsertSchema,
        TUpdateSchema,
        TSelectSchema
    > {
        return Object.keys(this.userIdSchema.shape).length > 0;
    }
}

/**
 * Builder for creating feature table configurations using a fluent API.
 *
 * Provides methods to configure:
 * - ID fields (.setIds)
 * - User ID field for row-level security (.setUserId)
 * - Which fields can be inserted/updated (.defineUpsertData)
 * - Which columns are returned in queries (.defineReturnColumns)
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
 *   .defineUpsertData(['name', 'description']) // Limit insertable fields
 *   .defineReturnColumns(['id', 'name'])       // Specify return columns
 *   .build();                    // Build immutable config
 * ```
 */
export class FeatureTableConfigBuilder<
    TTable extends Table,
    TBase extends TZodShape = InferTableSchema<TTable, 'insert'>['shape'],
    TInsertSchema extends TZodShape = InferTableSchema<TTable, 'insert'>['shape'],
    TUpdateSchema extends TZodShape = InferTableSchema<TTable, 'update'>['shape'],
    TSelectSchema extends TZodShape = InferTableSchema<TTable, 'select'>['shape'],
    TIdSchema extends TZodShape = EmptySchema,
    TUserIdSchema extends TZodShape = EmptySchema,
> {
    private table: TTable;
    private idSchemaObj: z.ZodObject<TIdSchema>;
    private userIdSchemaObj: z.ZodObject<TUserIdSchema>;
    private baseSchemaObj: z.ZodObject<TBase>;
    private insertSchemaObj: z.ZodObject<TInsertSchema>;
    private updateSchemaObj: z.ZodObject<TUpdateSchema>;
    private selectSchemaObj: z.ZodObject<TSelectSchema>;

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
        insertSchemaObj: z.ZodObject<TInsertSchema>;
        updateSchemaObj: z.ZodObject<TUpdateSchema>;
        selectSchemaObj: z.ZodObject<TSelectSchema>;
    }) {
        this.table = config.table;
        this.idSchemaObj = config.idSchemaObj;
        this.userIdSchemaObj = config.userIdSchemaObj;
        this.baseSchemaObj = config.baseSchemaObj;
        this.insertSchemaObj = config.insertSchemaObj;
        this.updateSchemaObj = config.updateSchemaObj;
        this.selectSchemaObj = config.selectSchemaObj;
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
        type TBase = InferTableSchema<TTable, 'insert'>['shape'];
        type TInsertSchema = InferTableSchema<TTable, 'insert'>['shape'];
        type TUpdateSchema = InferTableSchema<TTable, 'update'>['shape'];
        type TSelectSchema = InferTableSchema<TTable, 'select'>['shape'];

        return new FeatureTableConfigBuilder<
            TTable,
            TBase,
            TInsertSchema,
            TUpdateSchema,
            TSelectSchema,
            EmptySchema,
            EmptySchema
        >({
            table,
            idSchemaObj: z.object({}),
            userIdSchemaObj: z.object({}),
            baseSchemaObj: z.object(createInsertSchema(table).shape),
            insertSchemaObj: z.object(createInsertSchema(table).shape),
            updateSchemaObj: z.object(createUpdateSchema(table).shape),
            selectSchemaObj: z.object(createSelectSchema(table).shape),
        });
    }

    /** @internal Helper to get raw Zod shape for insert/select/update operations */
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
        return createInsertSchema(this.table).shape;
    }

    /**
     * Define which field(s) are used as primary keys.
     *
     * Used for operations like getById, deleteById, etc.
     * Supports composite keys by passing multiple fields.
     *
     * @param fields - Array of column names that form the primary key
     * @returns New builder instance with ID schema configured
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
        const idSchemaObj = pickFields(
            z.object(this.getRawSchemaFromTable('select')),
            fields
        ).required();

        type NewIdSchema = typeof idSchemaObj.shape;

        return new FeatureTableConfigBuilder<
            TTable,
            TBase,
            TInsertSchema,
            TUpdateSchema,
            TSelectSchema,
            NewIdSchema,
            TUserIdSchema
        >({
            table: this.table,
            idSchemaObj,
            userIdSchemaObj: this.userIdSchemaObj,
            baseSchemaObj: this.baseSchemaObj,
            insertSchemaObj: this.insertSchemaObj,
            updateSchemaObj: this.updateSchemaObj,
            selectSchemaObj: this.selectSchemaObj,
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
            TInsertSchema,
            TUpdateSchema,
            TSelectSchema,
            TIdSchema,
            NewUserIdSchema
        >({
            table: this.table,
            idSchemaObj: this.idSchemaObj,
            userIdSchemaObj,
            baseSchemaObj: this.baseSchemaObj,
            insertSchemaObj: this.insertSchemaObj,
            updateSchemaObj: this.updateSchemaObj,
            selectSchemaObj: this.selectSchemaObj,
        });
    }

    /**
     * Define which fields can be inserted/updated (upsert operations).
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
     *   .defineUpsertData(['name', 'description', 'color'])
     *   .build();
     *
     * // Users can only insert/update name, description, color
     * // Fields like id, createdAt, etc. are protected
     * ```
     */
    defineUpsertData<const TFields extends (keyof TBase)[]>(fields: TFields) {
        const baseSchemaObj = pickFields(this.baseSchemaObj, fields);

        return new FeatureTableConfigBuilder<
            TTable,
            typeof baseSchemaObj.shape,
            typeof baseSchemaObj.shape,
            typeof baseSchemaObj.shape,
            TSelectSchema,
            TIdSchema,
            TUserIdSchema
        >({
            table: this.table,
            baseSchemaObj,
            idSchemaObj: this.idSchemaObj,
            userIdSchemaObj: this.userIdSchemaObj,
            insertSchemaObj: baseSchemaObj,
            updateSchemaObj: baseSchemaObj,
            selectSchemaObj: this.selectSchemaObj,
        });
    }

    /**
     * Define which fields are allowed for insert operations only.
     *
     * Use this when insert fields differ from update fields.
     * For same fields in both, use `.defineUpsertData()` instead.
     *
     * @param fields - Array of field names allowed for inserts
     * @returns New builder instance with restricted insert schema
     *
     * @example
     * ```ts
     * const config = createFeatureTableConfig(table)
     *   .defineInsertData(['name', 'email', 'role'])
     *   .defineUpdateData(['name', 'email'])  // role can't be updated
     *   .build();
     * ```
     */
    defineInsertData<const TFields extends (keyof TBase)[]>(fields: TFields) {
        const insertSchemaObj = pickFields(this.baseSchemaObj, fields);

        return new FeatureTableConfigBuilder<
            TTable,
            TBase,
            typeof insertSchemaObj.shape,
            TUpdateSchema,
            TSelectSchema,
            TIdSchema,
            TUserIdSchema
        >({
            table: this.table,
            baseSchemaObj: this.baseSchemaObj,
            idSchemaObj: this.idSchemaObj,
            userIdSchemaObj: this.userIdSchemaObj,
            insertSchemaObj,
            updateSchemaObj: this.updateSchemaObj,
            selectSchemaObj: this.selectSchemaObj,
        });
    }

    /**
     * Define which fields are allowed for update operations only.
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
     *   .defineInsertData(['name', 'email', 'role'])
     *   .defineUpdateData(['name', 'email'])  // can't update role
     *   .build();
     *
     * // Update schema will be: { name?: string; email?: string }
     * ```
     */
    defineUpdateData<const TFields extends (keyof TBase)[]>(fields: TFields) {
        const updateSchemaObj = pickFields(this.baseSchemaObj, fields).partial();

        return new FeatureTableConfigBuilder<
            TTable,
            TBase,
            TInsertSchema,
            typeof updateSchemaObj.shape,
            TSelectSchema,
            TIdSchema,
            TUserIdSchema
        >({
            table: this.table,
            baseSchemaObj: this.baseSchemaObj,
            idSchemaObj: this.idSchemaObj,
            userIdSchemaObj: this.userIdSchemaObj,
            insertSchemaObj: this.insertSchemaObj,
            updateSchemaObj,
            selectSchemaObj: this.selectSchemaObj,
        });
    }

    /**
     * Define which columns should be returned in query results.
     *
     * Restricts select operations to only return the specified columns.
     * Useful for excluding sensitive fields or optimizing query performance.
     *
     * @param fields - Array of column names to include in results
     * @returns New builder instance with restricted select schema
     *
     * @example
     * ```ts
     * const config = createFeatureTableConfig(userTable)
     *   .defineReturnColumns(['id', 'name', 'email'])
     *   .build();
     *
     * // Query results will only include: { id, name, email }
     * // password, createdAt, etc. won't be returned
     * ```
     */
    defineReturnColumns<
        const TFields extends (keyof InferTableSchema<TTable, 'select'>['shape'])[],
    >(fields: TFields) {
        const selectSchemaObj = pickFields(
            z.object(this.getRawSchemaFromTable('select')),
            fields
        ).required();

        return new FeatureTableConfigBuilder<
            TTable,
            TBase,
            TInsertSchema,
            TUpdateSchema,
            typeof selectSchemaObj.shape,
            TIdSchema,
            TUserIdSchema
        >({
            table: this.table,
            baseSchemaObj: this.baseSchemaObj,
            idSchemaObj: this.idSchemaObj,
            userIdSchemaObj: this.userIdSchemaObj,
            insertSchemaObj: this.insertSchemaObj,
            updateSchemaObj: this.updateSchemaObj,
            selectSchemaObj,
        });
    }

    /**
     * Build the final immutable configuration object.
     *
     * Creates a FeatureTableConfig instance with all configured schemas.
     * This is the final step in the builder chain - returns an immutable config
     * that can be passed to query builders, services, and other utilities.
     *
     * @returns Immutable FeatureTableConfig with all schemas finalized
     *
     * @example
     * ```ts
     * const config = createFeatureTableConfig(table)
     *   .setIds(['id'])
     *   .setUserId('userId')
     *   .defineUpsertData(['name', 'description'])
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
        TInsertSchema,
        TUpdateSchema,
        TSelectSchema
    > {
        return new FeatureTableConfig({
            table: this.table,
            idSchema: this.idSchemaObj,
            userIdSchema: this.userIdSchemaObj,
            baseSchema: this.baseSchemaObj,
            insertSchema: this.insertSchemaObj,
            updateSchema: this.updateSchemaObj,
            selectSchema: this.selectSchemaObj,
        });
    }
}
