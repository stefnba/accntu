import { TZodShape } from '@/lib/schemas/types';
import { InferTableSchema } from '@/server/lib/db/table/feature-config/types';
import { pickFields } from '@/server/lib/db/table/table-config';
import { Table } from 'drizzle-orm';
import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-zod';
import z from 'zod';

export class FeatureTableConfigBuilder<
    TTable extends Table,
    TBase extends TZodShape = InferTableSchema<TTable, 'insert'>['shape'],
    TInsertSchema extends TZodShape = InferTableSchema<TTable, 'insert'>['shape'],
    TUpdateSchema extends TZodShape = InferTableSchema<TTable, 'update'>['shape'],
    TSelectSchema extends TZodShape = InferTableSchema<TTable, 'select'>['shape'],
    TIdSchema extends TZodShape | undefined = undefined,
    TUserIdSchema extends TZodShape | undefined = undefined,
> {
    table: TTable;
    baseSchema: TBase;
    idSchema: TIdSchema;
    userIdSchema: TUserIdSchema;
    insertSchema: TInsertSchema;
    updateSchema: TUpdateSchema;
    selectSchema: TSelectSchema;

    private constructor({
        table,

        idSchema,
        userIdSchema,
        baseSchema,
        insertSchema,
        updateSchema,
        selectSchema,
    }: {
        table: TTable;
        baseSchema: TBase;
        idSchema: TIdSchema;
        userIdSchema: TUserIdSchema;
        insertSchema: TInsertSchema;
        updateSchema: TUpdateSchema;
        selectSchema: TSelectSchema;
    }) {
        this.table = table;

        this.baseSchema = baseSchema;
        this.idSchema = idSchema;
        this.userIdSchema = userIdSchema;
        this.insertSchema = insertSchema;
        this.updateSchema = updateSchema;
        this.selectSchema = selectSchema;
    }

    static create<TTable extends Table>(table: TTable) {
        type TBase = InferTableSchema<TTable, 'insert'>['shape'];
        type TInsertSchema = InferTableSchema<TTable, 'insert'>['shape'];
        type TUpdateSchema = InferTableSchema<TTable, 'update'>['shape'];
        type TSelectSchema = InferTableSchema<TTable, 'select'>['shape'];

        const baseSchema = createInsertSchema(table).shape;
        const idSchema = undefined;
        const userIdSchema = undefined;
        const insertSchema = createInsertSchema(table).shape;
        const updateSchema = createUpdateSchema(table).shape;
        const selectSchema = createSelectSchema(table).shape;

        type TIdSchema = typeof idSchema;
        type TUserIdSchema = typeof userIdSchema;

        return new FeatureTableConfigBuilder<
            TTable,
            TBase,
            TInsertSchema,
            TUpdateSchema,
            TSelectSchema,
            TIdSchema,
            TUserIdSchema
        >({
            table,
            baseSchema,
            idSchema,
            userIdSchema,
            insertSchema,
            updateSchema,
            selectSchema,
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

    setIds<const TFields extends (keyof InferTableSchema<TTable, 'select'>['shape'])[]>(
        fields: TFields
    ) {
        const idSchema = pickFields(
            z.object(this.getRawSchemaFromTable('select')),
            fields
        ).required().shape;

        return new FeatureTableConfigBuilder<
            TTable,
            TBase,
            TInsertSchema,
            TUpdateSchema,
            TSelectSchema,
            typeof idSchema, // NEW type
            TUserIdSchema
        >({
            table: this.table,
            baseSchema: this.baseSchema,
            idSchema, // NEW value
            userIdSchema: this.userIdSchema,
            insertSchema: this.insertSchema,
            updateSchema: this.updateSchema,
            selectSchema: this.selectSchema,
        });
    }

    setUserId<const TFields extends keyof InferTableSchema<TTable, 'select'>['shape']>(
        fields: TFields
    ) {
        const userIdSchema = pickFields(z.object(this.getRawSchemaFromTable('select')), [
            fields,
        ]).required().shape;

        return new FeatureTableConfigBuilder<
            TTable,
            TBase,
            TInsertSchema,
            TUpdateSchema,
            TSelectSchema,
            TIdSchema,
            typeof userIdSchema // NEW type
        >({
            table: this.table,
            baseSchema: this.baseSchema,
            idSchema: this.idSchema, // NEW value
            userIdSchema, // NEW value
            insertSchema: this.insertSchema,
            updateSchema: this.updateSchema,
            selectSchema: this.selectSchema,
        });
    }

    // restrictBase<const TFields extends (keyof TBase)[]>(fields: TFields) {
    //     const baseSchema = pickFields(z.object(this.baseSchema), fields).shape;
    //     return new FeatureTableConfigBuilder<
    //         TTable,
    //         typeof baseSchema,
    //         typeof baseSchema,
    //         typeof baseSchema,
    //         TSelectSchema,
    //         typeof this.idSchema,
    //         typeof this.userIdSchema
    //     >({
    //         table: this.table,
    //         baseSchema,
    //         idSchema: this.idSchema ?? z.object({}).shape,
    //         userIdSchema: this.userIdSchema ?? z.object({}).shape,
    //         insertSchema: baseSchema,
    //         updateSchema: baseSchema,
    //         selectSchema: this.selectSchema,
    //     });
    // }

    // defineInsertData<const TFields extends (keyof TBase)[]>(fields: TFields) {
    //     const insertSchema = pickFields(z.object(this.baseSchema), fields).shape;
    //     return new FeatureTableConfigBuilder<
    //         TTable,
    //         TBase,
    //         typeof insertSchema,
    //         TUpdateSchema,
    //         TSelectSchema,
    //         typeof this.idSchema,
    //         typeof this.userIdSchema
    //     >({
    //         table: this.table,
    //         baseSchema: this.baseSchema,
    //         idSchema: this.idSchema ?? z.object({}).shape,
    //         userIdSchema: this.userIdSchema ?? z.object({}).shape,
    //         insertSchema,
    //         updateSchema: this.updateSchema,
    //         selectSchema: this.selectSchema,
    //     });
    // }

    // defineUpdateData<const TFields extends (keyof TBase)[]>(fields: TFields) {
    //     const updateSchema = pickFields(z.object(this.baseSchema), fields).partial().shape;
    //     return new FeatureTableConfigBuilder<
    //         TTable,
    //         TBase,
    //         TInsertSchema,
    //         typeof updateSchema,
    //         TSelectSchema,
    //         typeof this.idSchema,
    //         typeof this.userIdSchema
    //     >({
    //         table: this.table,
    //         baseSchema: this.baseSchema,
    //         idSchema: this.idSchema ?? z.object({}).shape,
    //         userIdSchema: this.userIdSchema ?? z.object({}).shape,
    //         insertSchema: this.insertSchema,
    //         updateSchema,
    //         selectSchema: this.selectSchema,
    //     });
    // }

    // defineReturnColumns<
    //     const TFields extends (keyof InferTableSchema<TTable, 'select'>['shape'])[],
    // >(fields: TFields) {
    //     const selectSchema = pickFields(
    //         z.object(this.getRawSchemaFromTable('select')),
    //         fields
    //     ).required().shape;
    //     return new FeatureTableConfigBuilder<
    //         TTable,
    //         TBase,
    //         TInsertSchema,
    //         TUpdateSchema,
    //         typeof selectSchema,
    //         typeof this.idSchema,
    //         typeof this.userIdSchema
    //     >({
    //         table: this.table,
    //         baseSchema: this.baseSchema,
    //         idSchema: this.idSchema ?? z.object({}).shape,
    //         userIdSchema: this.userIdSchema ?? z.object({}).shape,
    //         insertSchema: this.insertSchema,
    //         updateSchema: this.updateSchema,
    //         selectSchema,
    //     });
    // }

    build(): {
        idSchema: TIdSchema extends undefined ? undefined : z.ZodObject<TIdSchema & {}>;
        userIdSchema: TUserIdSchema extends undefined ? undefined : z.ZodObject<TUserIdSchema & {}>;
        baseSchema: z.ZodObject<TBase>;
        insertSchema: z.ZodObject<TInsertSchema>;
        updateSchema: Partial<z.ZodObject<TUpdateSchema>>;
        selectSchema: z.ZodObject<TSelectSchema>;
    } {
        return {
            idSchema: (this.idSchema
                ? z.object(this.idSchema)
                : undefined) as TIdSchema extends undefined
                ? undefined
                : z.ZodObject<TIdSchema & {}>,
            userIdSchema: (this.userIdSchema
                ? z.object(this.userIdSchema)
                : undefined) as TUserIdSchema extends undefined
                ? undefined
                : z.ZodObject<TUserIdSchema & {}>,
            baseSchema: z.object(this.baseSchema),
            insertSchema: z.object(this.insertSchema),
            updateSchema: z.object(this.updateSchema).partial().shape,
            selectSchema: z.object(this.selectSchema),
        };
    }
}
