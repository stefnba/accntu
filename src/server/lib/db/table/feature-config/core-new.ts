import { getFieldsAsArray, getFieldsAsArrayConstrained } from '@/lib/utils/zod';
import { paginationSchema } from '@/server/lib/db/table/feature-config/schemas';
import {
    ConditionalTest,
    ConditionalTestArray,
    TFeatureTableConfig,
} from '@/server/lib/db/table/feature-config/types';
import { TZodShape } from '@/types/zod';
import { Table } from 'drizzle-orm';
import z from 'zod';

export class FeatureTableConfig<TTable extends Table, C extends TFeatureTableConfig<TTable>> {
    config: C;

    constructor({ config }: { config: C }) {
        this.config = config;
    }

    // ========================================
    // Pagination
    // ========================================

    getPaginationSchema(): z.ZodObject<C['pagination']> {
        return z.object(this.config.pagination);
    }

    validatePaginationInput(input: unknown) {
        const validated = paginationSchema.safeParse(input);
        if (validated.success) {
            return validated.data;
        }
        return {
            page: undefined,
            pageSize: undefined,
        };
    }

    hasPaginationSchema(): this is FeatureTableConfig<TTable, C & { pagination: TZodShape }> {
        return Object.keys(this.config.pagination).length > 0;
    }

    // ========================================
    // Filters
    // ========================================

    getFiltersSchema(): z.ZodObject<C['filters']> {
        return z.object(this.config.filters);
    }

    hasFiltersSchema(): this is FeatureTableConfig<TTable, C & { filters: TZodShape }> {
        return Object.keys(this.config.filters).length > 0;
    }

    validateFiltersInput(input: unknown) {
        const validated = this.getFiltersSchema().safeParse(input);
        if (validated.success) {
            return validated.data;
        }
        return undefined;
    }

    // ========================================
    // Ordering
    // ========================================

    hasOrderingSchema(): this is FeatureTableConfig<TTable, C & { ordering: TZodShape }> {
        return Object.keys(this.config.ordering).length > 0;
    }

    validateOrderingInput(input: unknown) {
        const validated = this.getOrderingSchema().safeParse(input);
        if (validated.success) {
            return validated.data;
        }
        return undefined;
    }

    getOrderingSchema(): C['ordering'] {
        return this.config.ordering;
    }

    // ========================================
    // Many Input
    // ========================================

    buildManyInputSchema() {
        const shape: TZodShape = {};

        // filters
        const filtersSchema = z.object({
            filters: this.getFiltersSchema().partial().optional(),
        });
        if (this.hasFiltersSchema()) {
            Object.assign(shape, filtersSchema.shape);
        }

        // ordering
        const orderingSchema = z.object({
            ordering: this.getOrderingSchema().optional(),
        });
        if (this.hasOrderingSchema()) {
            Object.assign(shape, {
                ordering: orderingSchema.shape,
            });
        }

        // pagination
        const paginationSchema = z.object({
            pagination: this.getPaginationSchema().partial().optional(),
        });
        if (this.hasPaginationSchema()) {
            Object.assign(shape, {
                pagination: paginationSchema.shape,
            });
        }

        return z.object(shape) as z.ZodObject<
            ConditionalTest<C['filters'], (typeof filtersSchema)['shape']> &
                ConditionalTest<C['pagination'], (typeof paginationSchema)['shape']> &
                ConditionalTestArray<C['ordering'], (typeof orderingSchema)['shape']>
        >;
    }

    // ========================================
    // Create
    // ========================================

    getCreateDataSchema(): z.ZodObject<C['createData']> {
        return z.object(this.config.createData);
    }

    // ========================================
    // Update
    // ========================================

    getUpdateDataSchema(): z.ZodObject<C['updateData']> {
        return z.object(this.config.updateData);
    }

    // ========================================
    // Return Columns
    // ========================================

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
    getReturnColumns(): Array<Extract<keyof C['returnCols'], keyof TTable['_']['columns']>> {
        return getFieldsAsArrayConstrained(z.object(this.config.returnCols), this.config.table);
    }

    // ========================================
    // User ID
    // ========================================

    /**
     * Get the name of the user ID field.
     *
     * Returns the field name configured via `.setUserId()`.
     *
     * @returns User ID field name, or undefined if no userId is configured
     *
     * @example
     * ```ts
     * const fieldName = config.getUserIdFieldName(); // 'userId' or undefined
     *
     * // Or with type guard:
     * if (config.hasUserId()) {
     *   const fieldName = config.getUserIdFieldName(); // 'userId'
     * }
     * ```
     */
    getUserIdFieldName(): keyof C['userId'] {
        const fields = getFieldsAsArray(z.object(this.config.userId));
        return fields[0];
    }

    getUserIdSchema(): z.ZodObject<C['userId']> {
        return z.object(this.config.userId);
    }

    hasUserIdSchema(): this is FeatureTableConfig<TTable, C & { userId: TZodShape }> {
        return Object.keys(this.config.userId).length > 0;
    }

    // ========================================
    // ID fields
    // ========================================

    getIdSchema(): z.ZodObject<C['id']> {
        return z.object(this.config.id);
    }

    hasIdSchema(): this is FeatureTableConfig<TTable, C & { id: TZodShape }> {
        return Object.keys(this.config.id).length > 0;
    }

    /**
     * Get the names of all ID fields.
     *
     * Returns an array of field names configured via `.setIds()`.
     * Useful for composite keys.
     *
     * @returns Array of ID field names, or undefined if no IDs are configured
     *
     * @example
     * ```ts
     * const idFields = config.getIdsFieldNames(); // ['id'] or undefined
     *
     * // Or with type guard:
     * if (config.hasIds()) {
     *   const idFields = config.getIdsFieldNames(); // ['id'] or ['tenantId', 'id']
     * }
     * ```
     */
    getIdsFieldNames(): Array<keyof C['id']> {
        const fields = getFieldsAsArray(z.object(this.config.id));
        return fields;
    }
}
