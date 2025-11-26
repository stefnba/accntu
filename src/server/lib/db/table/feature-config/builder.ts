import {
    type TEmptySchema,
    type TZodArray,
    type TZodShape,
    type TZodType,
    omitFields,
    pickFields,
    safeOmit,
} from '@/lib/validation';

import { FeatureTableConfig } from '@/server/lib/db/table/feature-config/core';
import { orderByDirectionSchema } from '@/server/lib/db/table/feature-config/schemas';
import {
    InferDefaultSchemaForField,
    InferTableSchema,
    TFeatureTableConfig,
} from '@/server/lib/db/table/feature-config/types';
import { getSchemaForTableField } from '@/server/lib/db/table/feature-config/utils';
import { SYSTEM_FIELDS_KEYS } from '@/server/lib/db/table/system-fields';
import { Prettify } from '@/types/utils';
import { Table } from 'drizzle-orm';
import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-zod';
import z, { ZodNever } from 'zod';
import { paginationSchema } from './schemas';

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
    C extends Readonly<TFeatureTableConfig<TTable>> = Readonly<{
        table: TTable;
        base: InferTableSchema<TTable, 'insert'>['shape'];
        filters: TEmptySchema;
        pagination: TEmptySchema;
        ordering: TZodArray<ZodNever>;
        updateData: TEmptySchema;
        createData: TEmptySchema;
        returnCols: InferTableSchema<TTable, 'select'>['shape'];
        id: TEmptySchema;
        userId: TEmptySchema;
    }>,
> {
    config: C;

    private constructor({ config }: { config: C }) {
        this.config = config;
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
    static create<TLocal extends Table>(table: TLocal) {
        // base and insert/update schemas
        const createSchema = safeOmit(createInsertSchema(table), SYSTEM_FIELDS_KEYS);
        const baseSchema = createSchema;
        const updateSchema = safeOmit(createUpdateSchema(table), SYSTEM_FIELDS_KEYS);
        const selectSchema = createSelectSchema(table);

        // id and userId schemas
        const idSchema = getSchemaForTableField(table, 'id');
        const userSchema = getSchemaForTableField(table, 'userId');

        return new FeatureTableConfigBuilder<
            TLocal,
            {
                table: TLocal;
                base: typeof createSchema.shape;
                createData: typeof createSchema.shape;
                filters: TEmptySchema;
                pagination: TEmptySchema;
                ordering: TZodArray<ZodNever>;
                updateData: typeof updateSchema.shape;
                returnCols: typeof selectSchema.shape;
                id: InferDefaultSchemaForField<TLocal, 'id'>['shape'];
                userId: InferDefaultSchemaForField<TLocal, 'userId'>['shape'];
            }
        >({
            config: {
                table,
                filters: {},
                pagination: {},
                ordering: z.array(z.never()),
                updateData: updateSchema.shape,
                createData: createSchema.shape,
                returnCols: selectSchema.shape,
                id: idSchema.shape,
                userId: userSchema.shape,
                base: baseSchema.shape,
            },
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
            return createInsertSchema(this.config.table).shape;
        }
        if (type === 'select') {
            return createSelectSchema(this.config.table).shape;
        }
        if (type === 'update') {
            return createUpdateSchema(this.config.table).shape;
        }
        // Default to insert shape if somehow invalid type (should not occur with union type param)
        return createInsertSchema(this.config.table).shape;
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
    enableOrdering<TColumns extends Array<keyof TTable['_']['columns'] & string>>(
        columns: TColumns
    ) {
        const orderingSchemaArray = z.array(
            z.object({
                field: z.enum(columns),
                direction: orderByDirectionSchema,
            })
        );

        return new FeatureTableConfigBuilder<
            TTable,
            Prettify<Omit<C, 'ordering'> & { ordering: typeof orderingSchemaArray }>
        >({
            config: {
                ...this.config,
                ordering: orderingSchemaArray,
            },
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
    enableFiltering<
        const TSchema extends Partial<Record<keyof C['table']['_']['columns'], TZodType>> &
            Record<string, TZodType>,
    >(schema: TSchema) {
        return new FeatureTableConfigBuilder<
            TTable,
            Prettify<Omit<C, 'filters'> & { filters: TSchema }>
        >({
            config: {
                ...this.config,
                filters: schema,
            },
        });
    }

    /**
     * Enable pagination for this table.
     *
     * Adds `page` and `pageSize` fields to the query schema.
     *
     * @returns New builder instance with pagination schema configured
     */
    enablePagination() {
        return new FeatureTableConfigBuilder<
            TTable,
            Prettify<
                Omit<C, 'pagination'> & {
                    pagination: (typeof paginationSchema)['shape'];
                }
            >
        >({
            config: {
                ...this.config,
                pagination: paginationSchema.shape,
            },
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
            Prettify<Omit<C, 'id'> & { id: typeof idSchemaObj.shape }>
        >({
            config: {
                ...this.config,
                id: idSchemaObj.shape,
            },
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
        return new FeatureTableConfigBuilder<
            TTable,
            Prettify<Omit<C, 'id'> & { id: TEmptySchema }>
        >({
            config: {
                ...this.config,
                id: {},
            },
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

        return new FeatureTableConfigBuilder<
            TTable,
            Prettify<Omit<C, 'userId'> & { userId: typeof userIdSchemaObj.shape }>
        >({
            config: {
                ...this.config,
                userId: userIdSchemaObj.shape,
            },
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
        return new FeatureTableConfigBuilder<
            TTable,
            Prettify<Omit<C, 'userId'> & { userId: TEmptySchema }>
        >({
            config: {
                ...this.config,
                userId: {},
            },
        });
    }

    /**
     * Allow all fields for insert and update operations, including system fields such as `userId`, `createdAt`, `updatedAt`, etc.
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
        const createSchema = createInsertSchema(this.config.table);
        const updateSchema = createUpdateSchema(this.config.table);

        return new FeatureTableConfigBuilder<
            TTable,
            Prettify<
                Omit<C, 'base' | 'createData' | 'updateData'> & {
                    base: typeof createSchema.shape;
                    createData: typeof createSchema.shape;
                    updateData: typeof updateSchema.shape;
                }
            >
        >({
            config: {
                ...this.config,
                base: createSchema.shape,
                createData: createSchema.shape,
                updateData: updateSchema.shape,
            },
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
    pickBaseSchema<const TFields extends Array<keyof C['base'] & string>>(fields: TFields) {
        const baseSchemaObj = pickFields(z.object(this.config.base), fields);

        return new FeatureTableConfigBuilder<
            TTable,
            Prettify<Omit<C, 'base'> & { base: Prettify<Pick<C['base'], TFields[number]>> }>
        >({
            config: {
                ...this.config,
                base: baseSchemaObj.shape,
            },
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
    omitBaseSchema<const TFields extends Array<keyof C['base'] & string>>(fields: TFields) {
        const baseSchemaObj = omitFields(z.object(this.config.base), fields);

        return new FeatureTableConfigBuilder<
            TTable,
            Prettify<
                Omit<C, 'base' | 'createData' | 'updateData'> & {
                    base: Prettify<Omit<C['base'], TFields[number]>>;
                    createData: Prettify<Omit<C['base'], TFields[number]>>;
                    updateData: Prettify<Omit<C['base'], TFields[number]>>;
                }
            >
        >({
            config: {
                ...this.config,
                base: baseSchemaObj.shape,
                createData: baseSchemaObj.shape,
                updateData: baseSchemaObj.shape,
            },
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
    restrictUpsertFields<const TFields extends Array<keyof C['base'] & string>>(fields: TFields) {
        const baseSchemaObj = pickFields(z.object(this.config.base), fields);

        return new FeatureTableConfigBuilder<
            TTable,
            Prettify<
                Omit<C, 'base' | 'createData' | 'updateData'> & {
                    base: Prettify<Pick<C['base'], TFields[number]>>;
                    createData: Prettify<Pick<C['base'], TFields[number]>>;
                    updateData: Prettify<Pick<C['base'], TFields[number]>>;
                }
            >
        >({
            config: {
                ...this.config,
                base: baseSchemaObj.shape,
                createData: baseSchemaObj.shape,
                updateData: baseSchemaObj.shape,
            },
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
    restrictInsertFields<const TFields extends Array<keyof C['base'] & string>>(fields: TFields) {
        const insertDataSchemaObj = pickFields(z.object(this.config.base), fields);

        return new FeatureTableConfigBuilder<
            TTable,
            Prettify<
                Omit<C, 'createData'> & { createData: Prettify<Pick<C['base'], TFields[number]>> }
            >
        >({
            config: {
                ...this.config,
                createData: insertDataSchemaObj.shape,
            },
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
    restrictUpdateFields<const TFields extends Array<keyof C['base'] & string>>(fields: TFields) {
        const updateDataSchemaObj = pickFields(z.object(this.config.base), fields).partial();

        return new FeatureTableConfigBuilder<
            TTable,
            Prettify<
                Omit<C, 'updateData'> & { updateData: Prettify<Pick<C['base'], TFields[number]>> }
            >
        >({
            config: {
                ...this.config,
                updateData: updateDataSchemaObj.shape,
            },
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
            Prettify<
                Omit<C, 'returnCols'> & {
                    returnCols: typeof selectReturnSchemaObj.shape;
                }
            >
        >({
            config: {
                ...this.config,
                returnCols: selectReturnSchemaObj.shape,
            },
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
     *   .restrictUpsertFields(['name', 'description'])
     *   .build();  // Final step - creates immutable config
     *
     * // Now use config with query builders, services, etc.
     * const query = createFeatureQuery(config);
     * ```
     */
    build() {
        return new FeatureTableConfig<TTable, C>({
            config: this.config,
        });
    }
}
