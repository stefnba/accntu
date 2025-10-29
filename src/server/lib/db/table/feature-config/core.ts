import { TZodShape } from '@/lib/schemas/types';
import { pickFields } from '@/server/lib/db/table/table-config';
import { Table } from 'drizzle-orm';
import {
    BuildSchema,
    createInsertSchema,
    createSelectSchema,
    createUpdateSchema,
} from 'drizzle-zod';
import z from 'zod';

export class FeatureTableConfigBuilder<
    TTable extends Table,
    TBase extends TZodShape,
    TInsertSchema extends TZodShape,
    TUpdateSchema extends TZodShape,
    TSelectSchema extends TZodShape,
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

    constructor({
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
        idSchema: TZodShape;
        userIdSchema: TZodShape;
        insertSchema: TInsertSchema;
        updateSchema: TUpdateSchema;
        selectSchema: TSelectSchema;
    }) {
        this.table = table;

        this.baseSchema = baseSchema;
        this.idSchema = idSchema as TIdSchema;
        this.userIdSchema = userIdSchema as TUserIdSchema;
        this.insertSchema = insertSchema;
        this.updateSchema = updateSchema;
        this.selectSchema = selectSchema;
    }

    /**
     * Returns the raw Zod shape for the specified table operation type.
     * Overloads allow correct return type per usage.
     */
    private getRawSchemaFromTable(
        type: 'insert'
    ): BuildSchema<'insert', TTable['_']['columns'], undefined, undefined>['shape'];
    private getRawSchemaFromTable(
        type: 'select'
    ): BuildSchema<'select', TTable['_']['columns'], undefined, undefined>['shape'];
    private getRawSchemaFromTable(
        type: 'update'
    ): BuildSchema<'update', TTable['_']['columns'], undefined, undefined>['shape'];
    private getRawSchemaFromTable(
        type: 'insert' | 'select' | 'update' = 'insert' as const
    ):
        | BuildSchema<'insert', TTable['_']['columns'], undefined, undefined>['shape']
        | BuildSchema<'select', TTable['_']['columns'], undefined, undefined>['shape']
        | BuildSchema<'update', TTable['_']['columns'], undefined, undefined>['shape'] {
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

    setIds<
        const TFields extends (keyof BuildSchema<
            'insert',
            TTable['_']['columns'],
            undefined,
            undefined
        >['shape'])[],
    >(fields: TFields) {
        const idSchema = pickFields(
            z.object(this.getRawSchemaFromTable('insert')),
            fields
        ).required().shape;
        return new FeatureTableConfigBuilder<
            TTable,
            TBase,
            TInsertSchema,
            TUpdateSchema,
            TSelectSchema,
            typeof idSchema,
            typeof this.userIdSchema
        >({
            table: this.table,
            baseSchema: this.baseSchema,
            idSchema,
            userIdSchema: this.userIdSchema ?? z.object({}).shape,
            insertSchema: this.insertSchema,
            updateSchema: this.updateSchema,
            selectSchema: this.selectSchema,
        });
    }

    setUserId<
        const TFields extends keyof BuildSchema<
            'insert',
            TTable['_']['columns'],
            undefined,
            undefined
        >['shape'],
    >(field: TFields) {
        const userIdSchema = pickFields(z.object(this.getRawSchemaFromTable('insert')), [
            field,
        ]).required().shape;
        return new FeatureTableConfigBuilder<
            TTable,
            TBase,
            TInsertSchema,
            TUpdateSchema,
            TSelectSchema,
            typeof this.idSchema,
            typeof userIdSchema
        >({
            table: this.table,
            baseSchema: this.baseSchema,
            idSchema: this.idSchema ?? z.object({}).shape,
            userIdSchema,
            insertSchema: this.insertSchema,
            updateSchema: this.updateSchema,
            selectSchema: this.selectSchema,
        });
    }

    restrictBase<const TFields extends (keyof TBase)[]>(fields: TFields) {
        const baseSchema = pickFields(z.object(this.baseSchema), fields).shape;
        return new FeatureTableConfigBuilder<
            TTable,
            typeof baseSchema,
            typeof baseSchema,
            typeof baseSchema,
            TSelectSchema,
            typeof this.idSchema,
            typeof this.userIdSchema
        >({
            table: this.table,
            baseSchema,
            idSchema: this.idSchema ?? z.object({}).shape,
            userIdSchema: this.userIdSchema ?? z.object({}).shape,
            insertSchema: baseSchema,
            updateSchema: baseSchema,
            selectSchema: this.selectSchema,
        });
    }

    defineInsertData<const TFields extends (keyof TBase)[]>(fields: TFields) {
        const insertSchema = pickFields(z.object(this.baseSchema), fields).shape;
        return new FeatureTableConfigBuilder<
            TTable,
            TBase,
            typeof insertSchema,
            TUpdateSchema,
            TSelectSchema,
            typeof this.idSchema,
            typeof this.userIdSchema
        >({
            table: this.table,
            baseSchema: this.baseSchema,
            idSchema: this.idSchema ?? z.object({}).shape,
            userIdSchema: this.userIdSchema ?? z.object({}).shape,
            insertSchema,
            updateSchema: this.updateSchema,
            selectSchema: this.selectSchema,
        });
    }

    defineUpdateData<const TFields extends (keyof TBase)[]>(fields: TFields) {
        const updateSchema = pickFields(z.object(this.baseSchema), fields).partial().shape;
        return new FeatureTableConfigBuilder<
            TTable,
            TBase,
            TInsertSchema,
            typeof updateSchema,
            TSelectSchema,
            typeof this.idSchema,
            typeof this.userIdSchema
        >({
            table: this.table,
            baseSchema: this.baseSchema,
            idSchema: this.idSchema ?? z.object({}).shape,
            userIdSchema: this.userIdSchema ?? z.object({}).shape,
            insertSchema: this.insertSchema,
            updateSchema,
            selectSchema: this.selectSchema,
        });
    }

    defineReturnColumns<
        const TFields extends (keyof BuildSchema<
            'select',
            TTable['_']['columns'],
            undefined,
            undefined
        >['shape'])[],
    >(fields: TFields) {
        const selectSchema = pickFields(
            z.object(this.getRawSchemaFromTable('select')),
            fields
        ).required().shape;
        return new FeatureTableConfigBuilder<
            TTable,
            TBase,
            TInsertSchema,
            TUpdateSchema,
            typeof selectSchema,
            typeof this.idSchema,
            typeof this.userIdSchema
        >({
            table: this.table,
            baseSchema: this.baseSchema,
            idSchema: this.idSchema ?? z.object({}).shape,
            userIdSchema: this.userIdSchema ?? z.object({}).shape,
            insertSchema: this.insertSchema,
            updateSchema: this.updateSchema,
            selectSchema,
        });
    }

    build(): {
        idSchema: z.ZodObject<TIdSchema & {}> | undefined;
        userIdSchema: z.ZodObject<TUserIdSchema & {}> | undefined;
        baseSchema: z.ZodObject<TBase>;
        insertSchema: z.ZodObject<TInsertSchema>;
        updateSchema: Partial<z.ZodObject<TUpdateSchema>>;
        selectSchema: z.ZodObject<TSelectSchema>;
    } {
        return {
            idSchema: this.idSchema ? z.object(this.idSchema) : undefined,
            userIdSchema: this.userIdSchema ? z.object(this.userIdSchema) : undefined,
            baseSchema: z.object(this.baseSchema),
            insertSchema: z.object(this.insertSchema),
            updateSchema: z.object(this.updateSchema).partial().shape,
            selectSchema: z.object(this.selectSchema),
        };
    }
}
