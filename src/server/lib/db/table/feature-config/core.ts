import { TZodShape } from '@/lib/schemas/types';
import { pickFields } from '@/server/lib/db/table/table-config';
import { Table } from 'drizzle-orm';
import z from 'zod';

export class FeatureTableConfigBuilder<
    TTable extends Table,
    TRaw extends TZodShape,
    TBase extends TZodShape,
    TInsertSchema extends TZodShape,
    TUpdateSchema extends TZodShape,
    TSelectSchema extends TZodShape,
    TIdSchema extends TZodShape | undefined = undefined,
    TUserIdSchema extends TZodShape | undefined = undefined,
> {
    table: TTable;
    rawSchema: TRaw;
    baseSchema: TBase;
    idSchema: TIdSchema;
    userIdSchema: TUserIdSchema;
    insertSchema: TInsertSchema;
    updateSchema: TUpdateSchema;
    selectSchema: TSelectSchema;

    constructor({
        table,
        rawSchema,
        idSchema,
        userIdSchema,
        baseSchema,
        insertSchema,
        updateSchema,
        selectSchema,
    }: {
        table: TTable;
        rawSchema: TRaw;
        baseSchema: TBase;
        idSchema: TZodShape;
        userIdSchema: TZodShape;
        insertSchema: TInsertSchema;
        updateSchema: TUpdateSchema;
        selectSchema: TSelectSchema;
    }) {
        this.table = table;
        this.rawSchema = rawSchema;
        this.baseSchema = baseSchema;
        this.idSchema = idSchema as TIdSchema;
        this.userIdSchema = userIdSchema as TUserIdSchema;
        this.insertSchema = insertSchema;
        this.updateSchema = updateSchema;
        this.selectSchema = selectSchema;
    }

    setIds<const TFields extends (keyof TRaw)[]>(fields: TFields) {
        const idSchema = pickFields(z.object(this.rawSchema), fields).required().shape;
        return new FeatureTableConfigBuilder<
            TTable,
            TRaw,
            TBase,
            TInsertSchema,
            TUpdateSchema,
            TSelectSchema,
            typeof idSchema,
            typeof this.userIdSchema
        >({
            table: this.table,
            rawSchema: this.rawSchema,
            baseSchema: this.baseSchema,
            idSchema,
            userIdSchema: this.userIdSchema ?? z.object({}).shape,
            insertSchema: this.insertSchema,
            updateSchema: this.updateSchema,
            selectSchema: this.selectSchema,
        });
    }

    setUserId<const TFields extends keyof TRaw>(field: TFields) {
        const userIdSchema = pickFields(z.object(this.rawSchema), [field]).required().shape;
        return new FeatureTableConfigBuilder<
            TTable,
            TRaw,
            TBase,
            TInsertSchema,
            TUpdateSchema,
            TSelectSchema,
            typeof this.idSchema,
            typeof userIdSchema
        >({
            table: this.table,
            rawSchema: this.rawSchema,
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
            TRaw,
            typeof baseSchema,
            typeof baseSchema,
            typeof baseSchema,
            TSelectSchema,
            typeof this.idSchema,
            typeof this.userIdSchema
        >({
            table: this.table,
            rawSchema: this.rawSchema,
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
            TRaw,
            TBase,
            typeof insertSchema,
            TUpdateSchema,
            TSelectSchema,
            typeof this.idSchema,
            typeof this.userIdSchema
        >({
            table: this.table,
            rawSchema: this.rawSchema,
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
            TRaw,
            TBase,
            TInsertSchema,
            typeof updateSchema,
            TSelectSchema,
            typeof this.idSchema,
            typeof this.userIdSchema
        >({
            table: this.table,
            rawSchema: this.rawSchema,
            baseSchema: this.baseSchema,
            idSchema: this.idSchema ?? z.object({}).shape,
            userIdSchema: this.userIdSchema ?? z.object({}).shape,
            insertSchema: this.insertSchema,
            updateSchema,
            selectSchema: this.selectSchema,
        });
    }

    defineReturnColumns<const TFields extends (keyof TRaw)[]>(fields: TFields) {
        const selectSchema = pickFields(z.object(this.rawSchema), fields).required().shape;
        return new FeatureTableConfigBuilder<
            TTable,
            TRaw,
            TBase,
            TInsertSchema,
            TUpdateSchema,
            typeof selectSchema,
            typeof this.idSchema,
            typeof this.userIdSchema
        >({
            table: this.table,
            rawSchema: this.rawSchema,
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
        rawSchema: z.ZodObject<TRaw>;
        insertSchema: z.ZodObject<TInsertSchema>;
        updateSchema: Partial<z.ZodObject<TUpdateSchema>>;
        selectSchema: z.ZodObject<TSelectSchema>;
    } {
        return {
            idSchema: this.idSchema ? z.object(this.idSchema) : undefined,
            userIdSchema: this.userIdSchema ? z.object(this.userIdSchema) : undefined,
            baseSchema: z.object(this.baseSchema),
            rawSchema: z.object(this.rawSchema),
            insertSchema: z.object(this.insertSchema),
            updateSchema: z.object(this.updateSchema).partial().shape,
            selectSchema: z.object(this.selectSchema),
        };
    }
}
