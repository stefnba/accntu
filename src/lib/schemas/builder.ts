import { inputHelpers } from '@/lib/schemas/helpers';
import { MappingCoreServiceInput, TOperationSchemaObject } from '@/lib/schemas/types';
import { TZodShape } from '@/lib/validation';
import z, { util } from 'zod';

/**
 * Core schema builder class that provides fluent API for constructing type-safe operation schemas.
 *
 * This builder allows you to:
 * - Transform schemas with custom logic
 * - Pick/omit specific fields
 * - Define ID fields for operations
 * - Set user field for authentication
 * - Add core CRUD operations with automatic input helpers
 * - Add custom operations with full control
 *
 * @template TFeatureSchemas - Accumulated operation schemas record
 * @template B - Base schema shape (current working schema)
 * @template R - Raw schema shape (original table/schema shape)
 * @template I - ID fields schema shape
 * @template U - User field key from raw schema
 *
 * @example
 * ```typescript
 * const { schemas } = createFeatureSchemas
 *   .registerTable(userTable)
 *   .omit({ createdAt: true, updatedAt: true })
 *   .setUserIdField('userId')
 *   .setIdFields({ id: true })
 *   .addCore('create', ({ baseSchema, buildInput }) => ({
 *     service: buildInput({ data: baseSchema }),
 *     endpoint: { json: baseSchema }
 *   }));
 * ```
 */
export class BaseSchemaBuilder<
    TFeatureSchemas extends Record<string, TOperationSchemaObject>,
    B extends TZodShape,
    R extends TZodShape = B,
    I extends TZodShape = TZodShape,
    const U extends keyof R & string = never,
> {
    schemas: TFeatureSchemas;
    baseSchema: z.ZodObject<B>;
    rawSchema: z.ZodObject<R>;
    idSchema: z.ZodObject<I>;
    userIdField: U;

    constructor({
        baseSchema,
        rawSchema,
        idSchema,
        userIdField,
    }: {
        schemas: TFeatureSchemas;
        baseSchema: B;
        rawSchema?: B;
        idSchema?: I;
        userIdField?: U;
    });
    // overload 2: schemas
    constructor({
        baseSchema,
        rawSchema,
        idSchema,
        userIdField,
    }: {
        schemas: TFeatureSchemas;
        baseSchema: B;
        rawSchema: R;
        idSchema?: I;
        userIdField: U;
    });
    // implement the constructor with all the overloads
    constructor({
        baseSchema,
        rawSchema,
        idSchema,
        userIdField,
        schemas,
    }: {
        baseSchema: B;
        rawSchema?: R;
        idSchema?: I;
        userIdField: U;
        schemas: TFeatureSchemas;
    }) {
        this.schemas = schemas;
        this.baseSchema = z.object(baseSchema);
        this.rawSchema = z.object(rawSchema);
        this.idSchema = z.object(idSchema);
        this.userIdField = userIdField;
    }

    /**
     * Transform the current base schema using a custom transformation function.
     * This allows you to extend, modify, or completely reshape the schema.
     *
     * @template TOut - The output schema shape after transformation
     * @param transformer - Function that takes current schema and returns new schema
     * @returns New builder instance with transformed schema
     *
     * @example
     * ```typescript
     * const builder = createFeatureSchemas
     *   .registerTable(userTable)
     *   .transform(schema =>
     *     schema.extend({
     *       fullName: z.string().min(1),
     *       displayColor: z.string().regex(/^#[0-9A-F]{6}$/)
     *     })
     *   );
     * ```
     */
    transform<TOut extends TZodShape>(transformer: (schema: z.ZodObject<B>) => z.ZodObject<TOut>) {
        return new BaseSchemaBuilder<TFeatureSchemas, TOut, R, I, U>({
            schemas: this.schemas,
            baseSchema: transformer(this.baseSchema).shape,
            rawSchema: this.rawSchema.shape,
            userIdField: this.userIdField,
            idSchema: this.idSchema.shape,
        });
    }

    /**
     * Create a new schema with only the specified fields from the current schema.
     * This is useful for creating focused schemas for specific operations.
     *
     * @template Mask - The field selection mask type
     * @param fields - Object specifying which fields to include (field: true)
     * @returns New builder instance with picked fields only
     *
     * @example
     * ```typescript
     * const builder = createFeatureSchemas
     *   .registerTable(userTable)
     *   .pick({ name: true, email: true }); // Only name and email fields
     * ```
     */
    pick<const Mask extends util.Mask<keyof B>>(fields: Mask) {
        return new BaseSchemaBuilder({
            schemas: this.schemas,
            baseSchema: this.baseSchema.pick(fields).shape,
            rawSchema: this.rawSchema.shape,
            userIdField: this.userIdField,
            idSchema: this.idSchema.shape,
        });
    }

    /**
     * Create a new schema excluding the specified fields from the current schema.
     * This is commonly used to remove audit fields or auto-generated fields.
     *
     * @template Mask - The field exclusion mask type
     * @param fields - Object specifying which fields to exclude (field: true)
     * @returns New builder instance without the omitted fields
     *
     * @example
     * ```typescript
     * const builder = createFeatureSchemas
     *   .registerTable(userTable)
     *   .omit({ createdAt: true, updatedAt: true, id: true }); // Remove audit fields
     * ```
     */
    omit<const Mask extends util.Mask<keyof B>>(fields: Mask) {
        return new BaseSchemaBuilder({
            schemas: this.schemas,
            baseSchema: this.baseSchema.omit(fields).shape,
            rawSchema: this.rawSchema.shape,
            userIdField: this.userIdField,
            idSchema: this.idSchema.shape,
        });
    }

    /**
     * Define which fields from the raw schema should be used as ID fields for operations.
     * ID fields are typically used in path parameters for REST endpoints and database lookups.
     *
     * @template Mask - The ID field selection mask type
     * @param fields - Object specifying which fields are ID fields (field: true)
     * @returns New builder instance with ID fields configured
     *
     * @example
     * ```typescript
     * const builder = createFeatureSchemas
     *   .registerTable(userTable)
     *   .setIdFields({ id: true }); // Use 'id' field for operations like getById, updateById
     *
     * // For composite keys:
     * const builder = createFeatureSchemas
     *   .registerTable(tagToTransactionTable)
     *   .setIdFields({ tagId: true, transactionId: true });
     * ```
     */
    setIdFields<const Mask extends util.Mask<keyof R>>(fields: Mask) {
        return new BaseSchemaBuilder({
            schemas: this.schemas,
            baseSchema: this.baseSchema.shape,
            rawSchema: this.rawSchema.shape,
            idSchema: this.rawSchema.pick(fields).required().shape,
            userIdField: this.userIdField,
        });
    }

    /**
     * Specify which field from the raw schema represents the user identifier.
     * This field will be automatically included in service input schemas for authentication.
     *
     * @template TKey - The user field key type (must be string)
     * @param field - The name of the user field (usually 'userId')
     * @returns New builder instance with user field configured
     *
     * @example
     * ```typescript
     * const builder = createFeatureSchemas
     *   .registerTable(userTable)
     *   .setUserIdField('userId'); // Operations will include userId automatically
     * ```
     */
    setUserIdField<const TKey extends keyof R & string>(field: TKey) {
        return new BaseSchemaBuilder<TFeatureSchemas, B, R, I, TKey>({
            schemas: this.schemas,
            baseSchema: this.baseSchema.shape,
            rawSchema: this.rawSchema.shape,
            idSchema: this.idSchema.shape,
            userIdField: field,
        });
    }

    /**
     * Add a core CRUD operation with automatic input helper generation.
     * Core operations (create, getById, updateById, removeById, getMany) come with
     * pre-built service input helpers that handle userId and pagination automatically.
     *
     * @template K - The operation key (must be a core operation name)
     * @template S - The operation schema object type
     * @param key - The operation name ('create', 'getById', 'updateById', 'removeById', 'getMany')
     * @param schemaObjectFn - Function that receives schema context and returns operation schemas
     * @returns New builder instance with the operation added
     *
     * @example
     * ```typescript
     * const builder = createFeatureSchemas
     *   .registerTable(userTable)
     *   .setUserIdField('userId')
     *   .setIdFields({ id: true })
     *   .addCore('create', ({ baseSchema, buildInput }) => ({
     *     service: buildInput({ data: baseSchema }),
     *     query: buildInput({ data: baseSchema }),
     *     endpoint: { json: baseSchema }
     *   }));
     * ```
     */
    addCore<
        const K extends Exclude<keyof MappingCoreServiceInput<R[U]>, keyof TFeatureSchemas> &
            string,
        S extends TOperationSchemaObject,
    >(
        key: K,
        schemaObjectFn: (params: {
            baseSchema: z.ZodObject<B>;
            rawSchema: z.ZodObject<R>;
            idFieldsSchema: z.ZodObject<I>;
            userIdField: R[U];
            buildInput: MappingCoreServiceInput<R[U], z.ZodObject<I>>[K];
        }) => S
    ) {
        const userIdField = this.rawSchema.shape[this.userIdField];
        const helpers = inputHelpers({ userId: userIdField, ids: this.idSchema })[key];

        const wrappedSchemaObjectFn = schemaObjectFn({
            baseSchema: this.baseSchema,
            rawSchema: this.rawSchema,
            idFieldsSchema: this.idSchema,
            userIdField: userIdField,
            buildInput: helpers,
        });

        return new BaseSchemaBuilder<TFeatureSchemas & Record<K, S>, B, R, I, U>({
            schemas: {
                ...this.schemas,
                [key]: wrappedSchemaObjectFn,
            },
            baseSchema: this.baseSchema.shape,
            rawSchema: this.rawSchema.shape,
            idSchema: this.idSchema.shape,
            userIdField: this.userIdField,
        });
    }

    /**
     * Add a custom operation with full control over schema definition.
     * Unlike core operations, custom operations don't have pre-built input helpers,
     * giving you complete flexibility to define any operation schema structure.
     *
     * @template K - The operation key (can be any string)
     * @template S - The operation schema object type
     * @param key - The operation name (any custom string)
     * @param schemaObjectFn - Function that receives schema context and returns operation schemas
     * @returns New builder instance with the custom operation added
     *
     * @example
     * ```typescript
     * const builder = createFeatureSchemas
     *   .registerTable(tagTable)
     *   .addCustom('assignToTransaction', ({ baseSchema, rawSchema }) => {
     *     const assignSchema = z.object({
     *       tagIds: z.array(rawSchema.pick({ tagId: true }).shape.tagId),
     *       transactionId: rawSchema.shape.transactionId
     *     });
     *
     *     return {
     *       service: assignSchema,
     *       endpoint: { json: assignSchema.omit({ transactionId: true }) }
     *     };
     *   });
     * ```
     */
    addCustom<const K extends string, S extends TOperationSchemaObject>(
        key: K,
        schemaObjectFn: (params: {
            baseSchema: z.ZodObject<B>;
            rawSchema: z.ZodObject<R>;
            idFieldsSchema: z.ZodObject<I>;
            userIdField: R[U];
            buildInput: MappingCoreServiceInput<R[U], z.ZodObject<I>>;
        }) => S
    ) {
        const userIdField = this.rawSchema.shape[this.userIdField];
        const wrappedSchemaObjectFn = schemaObjectFn({
            baseSchema: this.baseSchema,
            rawSchema: this.rawSchema,
            idFieldsSchema: this.idSchema,
            userIdField: userIdField,
            buildInput: inputHelpers({ userId: userIdField, ids: this.idSchema }),
        });

        return new BaseSchemaBuilder<TFeatureSchemas & Record<K, S>, B, R, I, U>({
            schemas: {
                ...this.schemas,
                [key]: wrappedSchemaObjectFn,
            },
            baseSchema: this.baseSchema.shape,
            rawSchema: this.rawSchema.shape,
            idSchema: this.idSchema.shape,
            userIdField: this.userIdField,
        });
    }
}
