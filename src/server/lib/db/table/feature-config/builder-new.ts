import { tag } from '@/server/db/tables';
import { FeatureTableConfig } from '@/server/lib/db/table/feature-config/core-new';
import { orderByDirectionSchema } from '@/server/lib/db/table/feature-config/schemas';
import { InferTableSchema, TFeatureTableConfig } from '@/server/lib/db/table/feature-config/types';
import { getSchemaForTableField } from '@/server/lib/db/table/feature-config/utils';
import { SystemTableFieldKeys } from '@/server/lib/db/table/system-fields';
import { fieldsToMask } from '@/server/lib/db/table/system-fields/utils';
import { Prettify } from '@/types/utils';
import { EmptySchema, TZodArray, TZodType } from '@/types/zod';
import { Table } from 'drizzle-orm';
import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-zod';
import z, { ZodNever } from 'zod';
import { paginationSchema } from './schemas';

export class FeatureTableConfigBuilder<
    TTable extends Table,
    C extends Readonly<TFeatureTableConfig<TTable>> = Readonly<{
        table: TTable;
        base: InferTableSchema<TTable, 'insert'>['shape'];
        filters: EmptySchema;
        pagination: EmptySchema;
        ordering: TZodArray<ZodNever>;
        updateData: EmptySchema;
        createData: EmptySchema;
        returnCols: InferTableSchema<TTable, 'select'>['shape'];
        id: EmptySchema;
        userId: EmptySchema;
    }>,
> {
    config: C;

    private constructor({ config }: { config: C }) {
        this.config = config;
    }

    static create<TLocal extends Table>(table: TLocal) {
        const createSchema = createInsertSchema(table).omit(fieldsToMask());
        const baseSchema = createSchema;
        const updateSchema = createUpdateSchema(table).omit(fieldsToMask());
        const selectSchema = createSelectSchema(table);
        const idSchema = getSchemaForTableField(table, 'id');
        const userSchema = getSchemaForTableField(table, 'userId');

        return new FeatureTableConfigBuilder<
            TLocal,
            {
                table: TLocal;
                base: Prettify<
                    Omit<InferTableSchema<TLocal, 'insert'>['shape'], SystemTableFieldKeys>
                >;
                createData: Prettify<
                    Omit<InferTableSchema<TLocal, 'insert'>['shape'], SystemTableFieldKeys>
                >;
                filters: EmptySchema;
                pagination: EmptySchema;
                ordering: TZodArray<ZodNever>;
                updateData: Prettify<
                    Omit<InferTableSchema<TLocal, 'update'>['shape'], SystemTableFieldKeys>
                >;
                returnCols: InferTableSchema<TLocal, 'select'>['shape'];
                id: EmptySchema;
                userId: EmptySchema;
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
            Omit<C, 'ordering'> & { ordering: typeof orderingSchemaArray }
        >({
            config: {
                ...this.config,
                ordering: orderingSchemaArray,
            },
        });
    }

    enableFilteing<
        const TSchema extends Partial<Record<keyof C['table']['_']['columns'], TZodType>> &
            Record<string, TZodType>,
    >(schema: TSchema) {
        return new FeatureTableConfigBuilder<TTable, Omit<C, 'filters'> & { filters: TSchema }>({
            config: {
                ...this.config,
                filters: schema,
            },
        });
    }

    enablePagination() {
        return new FeatureTableConfigBuilder<
            TTable,
            Omit<C, 'pagination'> & {
                pagination: (typeof paginationSchema)['shape'];
            }
        >({
            config: {
                ...this.config,
                pagination: paginationSchema.shape,
            },
        });
    }

    build() {
        return new FeatureTableConfig<TTable, C>({
            config: this.config,
        });
    }
}

const tagConfig = FeatureTableConfigBuilder.create(tag)
    .enablePagination()
    .enableFilteing({ name: z.string(), createdAt: z.date(), updatedAt: z.date() })
    .enableOrdering(['name', 'createdAt', 'updatedAt'])
    .build();

const tagConfig2 = tagConfig.config.pagination;

const paginationSchema2 = tagConfig.getPaginationSchema();
type TPagination = z.infer<typeof paginationSchema2>;

const orderingSchema = tagConfig.getOrderingSchema();
type TOrdering = z.infer<typeof orderingSchema>;

const filtersSchema = tagConfig.getFiltersSchema();
type TFilters = z.infer<typeof filtersSchema>;

const manyInputSchema = tagConfig.buildManyInputSchema();
type TManyInput = z.infer<typeof manyInputSchema>;

const pagination = tagConfig.validatePaginationInput({ page: 1, pageSize: 10 });
const filters = tagConfig.validateFiltersInput({ name: 'test', createdAt: new Date() });
const ordering = tagConfig.validateOrderingInput({ field: 'name', direction: 'asc' });

const input = (input: TManyInput) => {
    return manyInputSchema.parse(input);
};

input({
    // ordering: [{ field: 'name', direction: 'asc' }],
    pagination: { page: 1, pageSize: 10 },
    filters: { name: 'test', createdAt: new Date() },
});
