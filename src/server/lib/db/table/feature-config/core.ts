import { TZodShape } from '@/lib/schemas/types';
import { getFieldsAsArray, omitFields, pickFields } from '@/lib/utils/zod';
import { SystemTableFieldKeys } from '@/server/lib/db/table';
import {
    EmptySchema,
    InferDefaultSchemaForField,
    InferTableSchema,
} from '@/server/lib/db/table/feature-config/types';
import { getIdSchemaForTableField } from '@/server/lib/db/table/feature-config/utils';
import { fieldsToMask } from '@/server/lib/db/table/system-fields/utils';
import { AppErrors } from '@/server/lib/error';
import { Prettify } from '@/types/utils';
import { InferInsertModel, Table } from 'drizzle-orm';
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
 * const insertDataSchema = config.getInsertDataSchema();
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
> {
    /** The Drizzle table definition */
    readonly table: TTable;

    /** Schema for ID fields (empty if not configured via .setIds) */
    readonly idSchema: z.ZodObject<TIdSchema>;

    /** Schema for user ID field (empty if not configured via .setUserId) */
    readonly userIdSchema: z.ZodObject<TUserIdSchema>;

    /** Base schema - all available fields before restrictions */
    readonly baseSchema: z.ZodObject<TBase>;

    /** Schema for insert data operations (configurable via .defineUpsertData) */
    readonly insertDataSchema: z.ZodObject<TInsertDataSchema>;

    /** Schema for update data operations (partial, configurable via .defineUpsertData) */
    readonly updateDataSchema: z.ZodObject<TUpdateDataSchema>;

    /** Schema for select return operations (configurable via .defineReturnColumns) */
    readonly selectReturnSchema: z.ZodObject<TSelectReturnSchema>;

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
    }) {
        this.table = config.table;
        this.idSchema = config.idSchema;
        this.userIdSchema = config.userIdSchema;
        this.baseSchema = config.baseSchema;
        this.insertDataSchema = config.insertDataSchema;
        this.updateDataSchema = config.updateDataSchema;
        this.selectReturnSchema = config.selectReturnSchema;
    }

    /** Get the base Zod schema containing all available fields */
    getBaseSchema(): z.ZodObject<TBase> {
        return this.baseSchema;
    }

    /** Get the Zod schema for insert data operations */
    getInsertDataSchema(): z.ZodObject<TInsertDataSchema> {
        return this.insertDataSchema;
    }

    /** Get the Zod schema for update data operations (partial) */
    getUpdateDataSchema(): z.ZodObject<TUpdateDataSchema> {
        return this.updateDataSchema;
    }

    /** Get the Zod schema for select return operations */
    getSelectReturnSchema(): z.ZodObject<TSelectReturnSchema> {
        return this.selectReturnSchema;
    }

    /** Get the Drizzle table definition */
    getTable(): TTable {
        return this.table;
    }

    getUserIdFieldName(): keyof TUserIdSchema {
        return getFieldsAsArray(this.userIdSchema)[0];
    }

    getIdsFieldNames(): Array<keyof TIdSchema> {
        return getFieldsAsArray(this.idSchema);
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
    getReturnColumns(): (keyof TSelectReturnSchema)[] {
        return getFieldsAsArray(this.selectReturnSchema);
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
        TSelectReturnSchema
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
    // hasUserId(): this is FeatureTableConfig<
    //     TTable,
    //     TIdSchema,
    //     Exclude<TUserIdSchema, EmptySchema>,
    //     TBase,
    //     TInsertDataSchema,
    //     TUpdateDataSchema,
    //     TSelectReturnSchema
    // > {
    //     return Object.keys(this.userIdSchema.shape).length > 0;
    // }

    buildCreateInputSchema() {
        return z.object({ data: this.insertDataSchema }).extend(this.userIdSchema.shape);
    }

    buildUpdateInputSchema() {
        return z.object({ data: this.updateDataSchema }).extend(this.userIdSchema.shape).extend({
            ids: this.idSchema,
        });
    }

    buildIdentifierSChema() {
        return z
            .object({
                ids: this.idSchema,
            })
            .extend(this.userIdSchema.shape);
    }

    // buildUpdateInputSchemaCond(): IsEmptySchema<TIdSchema> extends true
    //     ? z.ZodObject<{ data: z.ZodObject<TUpdateDataSchema> }, z.core.$strip>
    //     : z.ZodObject<
    //           { ids: z.ZodObject<TIdSchema>; data: z.ZodObject<TUpdateDataSchema> },
    //           z.core.$strip
    //       > {
    //     // if (!this.hasIds()) {
    //     //     throw Error('Id schema needs to be defined for update');
    //     // }

    //     const base = z.object({ data: this.updateDataSchema }).extend(this.userIdSchema.shape);

    //     if (Object.keys(this.idSchema.shape).length > 0) {
    //         base.extend({
    //             ids: this.idSchema,
    //         });
    //     }

    //     return base;
    // }

    validateDataForTableInsert(input: unknown): InferInsertModel<TTable> {
        // schema as configured
        const schemaConfig = this.buildCreateInputSchema();
        const validatedInput = schemaConfig.safeParse(input);

        // schema for actual insert
        const schema = createInsertSchema(this.table);

        const result = schema.safeParse(input);
        // todo check if this assertion is safe
        if (result.success) return result.data as InferInsertModel<TTable>;

        console.error(result.error);

        throw AppErrors.validation('INVALID_INPUT', {});
    }

    validateUpdateDataforTableUpdate(input: unknown): InferTableSchema<TTable, 'update'> {
        const schema = createUpdateSchema(this.table);
        const result = schema.safeParse(input);
        // todo check if this assertion is safe
        if (result.success) return result.data as InferTableSchema<TTable, 'update'>;

        console.error(result.error);

        throw AppErrors.validation('INVALID_INPUT', {});
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
    TInsertDataSchema extends TZodShape = TBase,
    TUpdateDataSchema extends TZodShape = TBase,
    TSelectReturnSchema extends TZodShape = InferTableSchema<TTable, 'select'>['shape'],
    TIdSchema extends TZodShape = EmptySchema,
    TUserIdSchema extends TZodShape = EmptySchema,
> {
    private table: TTable;
    private idSchemaObj: z.ZodObject<TIdSchema>;
    private userIdSchemaObj: z.ZodObject<TUserIdSchema>;
    private baseSchemaObj: z.ZodObject<TBase>;
    private insertDataSchemaObj: z.ZodObject<TInsertDataSchema>;
    private updateDataSchemaObj: z.ZodObject<TUpdateDataSchema>;
    private selectReturnSchemaObj: z.ZodObject<TSelectReturnSchema>;

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
    }) {
        this.table = config.table;
        this.idSchemaObj = config.idSchemaObj;
        this.userIdSchemaObj = config.userIdSchemaObj;
        this.baseSchemaObj = config.baseSchemaObj;
        this.insertDataSchemaObj = config.insertDataSchemaObj;
        this.updateDataSchemaObj = config.updateDataSchemaObj;
        this.selectReturnSchemaObj = config.selectReturnSchemaObj;
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

        const idSchema = getIdSchemaForTableField(table, 'id');
        const userSchema = getIdSchemaForTableField(table, 'userId');

        return new FeatureTableConfigBuilder<
            TTable,
            Prettify<Omit<InferTableSchema<TTable, 'insert'>['shape'], SystemTableFieldKeys>>,
            Prettify<Omit<InferTableSchema<TTable, 'insert'>['shape'], SystemTableFieldKeys>>,
            Prettify<Omit<InferTableSchema<TTable, 'update'>['shape'], SystemTableFieldKeys>>,
            InferTableSchema<TTable, 'select'>['shape'],
            InferDefaultSchemaForField<TTable, 'id'>['shape'],
            InferDefaultSchemaForField<TTable, 'userId'>['shape']
        >({
            table,
            idSchemaObj: idSchema,
            userIdSchemaObj: userSchema,
            baseSchemaObj: baseSchemaObj,
            insertDataSchemaObj: baseSchemaObj,
            updateDataSchemaObj: createUpdateSchema(table).omit(fieldsToMask()),
            selectReturnSchemaObj: z.object(createSelectSchema(table).shape),
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
     *
     * Overwrites previously specified schemas for create and update data.
     */
    allowAllColumns() {
        const createSchema = createInsertSchema(this.table);
        const updateSchema = createUpdateSchema(this.table);

        return new FeatureTableConfigBuilder<
            TTable,
            InferTableSchema<TTable, 'insert'>['shape'],
            InferTableSchema<TTable, 'insert'>['shape'],
            InferTableSchema<TTable, 'update'>['shape'],
            TSelectReturnSchema,
            TIdSchema,
            TUserIdSchema
        >({
            table: this.table,
            idSchemaObj: this.idSchemaObj,
            userIdSchemaObj: this.userIdSchemaObj,
            baseSchemaObj: createSchema,
            insertDataSchemaObj: createSchema,
            updateDataSchemaObj: updateSchema,
            selectReturnSchemaObj: this.selectReturnSchemaObj,
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

        return new FeatureTableConfigBuilder<
            TTable,
            TBase,
            TInsertDataSchema,
            TUpdateDataSchema,
            TSelectReturnSchema,
            typeof idSchemaObj.shape,
            TUserIdSchema
        >({
            table: this.table,
            idSchemaObj,
            userIdSchemaObj: this.userIdSchemaObj,
            baseSchemaObj: this.baseSchemaObj,
            insertDataSchemaObj: this.insertDataSchemaObj,
            updateDataSchemaObj: this.updateDataSchemaObj,
            selectReturnSchemaObj: this.selectReturnSchemaObj,
        });
    }

    removeIds() {
        type NewIdSchema = EmptySchema;

        return new FeatureTableConfigBuilder<
            TTable,
            TBase,
            TInsertDataSchema,
            TUpdateDataSchema,
            TSelectReturnSchema,
            NewIdSchema,
            TUserIdSchema
        >({
            table: this.table,
            idSchemaObj: z.object({}),
            userIdSchemaObj: this.userIdSchemaObj,
            baseSchemaObj: this.baseSchemaObj,
            insertDataSchemaObj: this.insertDataSchemaObj,
            updateDataSchemaObj: this.updateDataSchemaObj,
            selectReturnSchemaObj: this.selectReturnSchemaObj,
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
            NewUserIdSchema
        >({
            table: this.table,
            idSchemaObj: this.idSchemaObj,
            userIdSchemaObj,
            baseSchemaObj: this.baseSchemaObj,
            insertDataSchemaObj: this.insertDataSchemaObj,
            updateDataSchemaObj: this.updateDataSchemaObj,
            selectReturnSchemaObj: this.selectReturnSchemaObj,
        });
    }

    removeUserId() {
        type NewUserIdSchema = EmptySchema;

        return new FeatureTableConfigBuilder<
            TTable,
            TBase,
            TInsertDataSchema,
            TUpdateDataSchema,
            TSelectReturnSchema,
            TIdSchema,
            NewUserIdSchema
        >({
            table: this.table,
            idSchemaObj: this.idSchemaObj,
            userIdSchemaObj: z.object({}),
            baseSchemaObj: this.baseSchemaObj,
            insertDataSchemaObj: this.insertDataSchemaObj,
            updateDataSchemaObj: this.updateDataSchemaObj,
            selectReturnSchemaObj: this.selectReturnSchemaObj,
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
            TSelectReturnSchema,
            TIdSchema,
            TUserIdSchema
        >({
            table: this.table,
            baseSchemaObj,
            idSchemaObj: this.idSchemaObj,
            userIdSchemaObj: this.userIdSchemaObj,
            insertDataSchemaObj: baseSchemaObj,
            updateDataSchemaObj: baseSchemaObj,
            selectReturnSchemaObj: this.selectReturnSchemaObj,
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
        const insertDataSchemaObj = pickFields(this.baseSchemaObj, fields);

        return new FeatureTableConfigBuilder<
            TTable,
            TBase,
            typeof insertDataSchemaObj.shape,
            TUpdateDataSchema,
            TSelectReturnSchema,
            TIdSchema,
            TUserIdSchema
        >({
            table: this.table,
            baseSchemaObj: this.baseSchemaObj,
            idSchemaObj: this.idSchemaObj,
            userIdSchemaObj: this.userIdSchemaObj,
            insertDataSchemaObj,
            updateDataSchemaObj: this.updateDataSchemaObj,
            selectReturnSchemaObj: this.selectReturnSchemaObj,
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
        const updateDataSchemaObj = pickFields(this.baseSchemaObj, fields).partial();

        return new FeatureTableConfigBuilder<
            TTable,
            TBase,
            TInsertDataSchema,
            typeof updateDataSchemaObj.shape,
            TSelectReturnSchema,
            TIdSchema,
            TUserIdSchema
        >({
            table: this.table,
            baseSchemaObj: this.baseSchemaObj,
            idSchemaObj: this.idSchemaObj,
            userIdSchemaObj: this.userIdSchemaObj,
            insertDataSchemaObj: this.insertDataSchemaObj,
            updateDataSchemaObj,
            selectReturnSchemaObj: this.selectReturnSchemaObj,
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
            TUserIdSchema
        >({
            table: this.table,
            baseSchemaObj: this.baseSchemaObj,
            idSchemaObj: this.idSchemaObj,
            userIdSchemaObj: this.userIdSchemaObj,
            insertDataSchemaObj: this.insertDataSchemaObj,
            updateDataSchemaObj: this.updateDataSchemaObj,
            selectReturnSchemaObj,
        });
    }

    pickBaseSchema<const TFields extends (keyof TBase)[]>(fields: TFields) {
        const baseSchemaObj = pickFields(this.baseSchemaObj, fields);

        return new FeatureTableConfigBuilder<
            TTable,
            typeof baseSchemaObj.shape,
            TInsertDataSchema,
            TUpdateDataSchema,
            TSelectReturnSchema,
            TIdSchema,
            TUserIdSchema
        >({
            table: this.table,
            baseSchemaObj: baseSchemaObj,
            idSchemaObj: this.idSchemaObj,
            userIdSchemaObj: this.userIdSchemaObj,
            insertDataSchemaObj: this.insertDataSchemaObj,
            updateDataSchemaObj: this.updateDataSchemaObj,
            selectReturnSchemaObj: this.selectReturnSchemaObj,
        });
    }

    omitBaseSchema<const TFields extends (keyof TBase)[]>(fields: TFields) {
        const baseSchemaObj = omitFields(this.baseSchemaObj, fields);

        return new FeatureTableConfigBuilder<
            TTable,
            typeof baseSchemaObj.shape,
            typeof baseSchemaObj.shape,
            typeof baseSchemaObj.shape,
            TSelectReturnSchema,
            TIdSchema,
            TUserIdSchema
        >({
            table: this.table,
            baseSchemaObj: baseSchemaObj,
            idSchemaObj: this.idSchemaObj,
            userIdSchemaObj: this.userIdSchemaObj,
            insertDataSchemaObj: baseSchemaObj,
            updateDataSchemaObj: baseSchemaObj,
            selectReturnSchemaObj: this.selectReturnSchemaObj,
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
        TInsertDataSchema,
        TUpdateDataSchema,
        TSelectReturnSchema
    > {
        return new FeatureTableConfig({
            table: this.table,
            idSchema: this.idSchemaObj,
            userIdSchema: this.userIdSchemaObj,
            baseSchema: this.baseSchemaObj,
            insertDataSchema: this.insertDataSchemaObj,
            updateDataSchema: this.updateDataSchemaObj,
            selectReturnSchema: this.selectReturnSchemaObj,
        });
    }
}
