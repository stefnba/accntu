import { QueryFeatureSchema } from '@/lib/schemas/layers/query';
import { TLayerSchemas, TZodSchema } from '@/lib/schemas/types';

export class BaseFeatureSchema<TBaseSchema extends TZodSchema> {
    baseSchema: TBaseSchema;

    constructor(baseSchema: TBaseSchema) {
        this.baseSchema = baseSchema;
    }

    createQuerySchema<TQuerySchemas extends TLayerSchemas>(
        querySchemaFn: (baseSchema: TBaseSchema) => TQuerySchemas
    ): QueryFeatureSchema<TBaseSchema, TQuerySchemas> {
        return new QueryFeatureSchema(this.baseSchema, querySchemaFn(this.baseSchema));
    }

    getBaseSchema(): TBaseSchema {
        return this.baseSchema;
    }

    build() {
        return {
            baseSchema: this.baseSchema,
        } as const;
    }
}
