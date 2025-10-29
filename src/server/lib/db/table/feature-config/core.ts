import { TZodShape } from '@/lib/schemas/types';
import { EmptySchema, InferTableSchema } from '@/server/lib/db/table/feature-config/types';
import { pickFields } from '@/server/lib/db/table/table-config';
import { Table } from 'drizzle-orm';
import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-zod';
import z from 'zod';

/**
 * Helper type to infer schema value, returning undefined if schema is empty.
 * Use this for consumer-facing type inference to get clean undefined semantics.
 *
 * @example
 * ```typescript
 * const config = createFeatureTableConfig(table).build();
 * type IdType = InferSchemaIfExists<typeof config.idSchema>; // undefined
 *
 * const config2 = createFeatureTableConfig(table).setIds(['id']).build();
 * type IdType2 = InferSchemaIfExists<typeof config2.idSchema>; // { id: string }
 * ```
 */
export type InferSchemaIfExists<T> =
    T extends z.ZodObject<infer S> ? (keyof S extends never ? undefined : z.infer<T>) : undefined;

/**
 * Final immutable configuration class for a feature table.
 * Contains all schemas and table reference needed for CRUD operations.
 *
 * Uses EmptySchema ({}) instead of undefined for optional schemas,
 * enabling zero-assertion type safety throughout the codebase.
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
    readonly table: TTable;
    readonly idSchema: z.ZodObject<TIdSchema>;
    readonly userIdSchema: z.ZodObject<TUserIdSchema>;
    readonly baseSchema: z.ZodObject<TBase>;
    readonly insertSchema: z.ZodObject<TInsertSchema>;
    readonly updateSchema: z.ZodObject<TUpdateSchema>;
    readonly selectSchema: z.ZodObject<TSelectSchema>;

    /**
     * Constructor with zero type assertions!
     * All properties and parameters use concrete ZodObject types.
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

    /**
     * Type guard to check if this config has ID schema defined (non-empty).
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
     * Type guard to check if this config has user ID schema defined (non-empty).
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
 * Builder for creating feature table configurations.
 * Uses fluent API to define ID fields, schemas, and column restrictions.
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
     * Zero type assertions! All types match perfectly.
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

    /**
     * Returns the raw Zod shape for the specified table operation type.
     * Overloads allow correct return type per usage.
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
        // Fallback, should never hit, but default to 'insert'
        return createInsertSchema(this.table).shape;
    }

    /**
     * Define which fields are used as IDs for this table.
     * These fields will be used for query operations like getById.
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
     * Define which field is used as the user ID for row-level security.
     * This field will be used to filter queries by the authenticated user.
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
     * Restrict the base schema to only include specific fields.
     * This will also update insert and update schemas to use the restricted base.
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
     * Define which fields are allowed for insert operations.
     * This creates a subset of the base schema for insertions.
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
     * Define which fields are allowed for update operations.
     * This creates a subset of the base schema for updates (automatically partial).
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
     * Define which columns should be returned in select operations.
     * This restricts the output to specific fields from the table.
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
     * Returns a FeatureTableConfig that can be passed to query builders and services.
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
