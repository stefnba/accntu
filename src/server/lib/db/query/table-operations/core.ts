import { typedKeys } from '@/lib/utils';
import { db } from '@/server/db';
import { GetTableColumnDefinitions, GetTableColumnKeys } from '@/server/lib/db/drizzle';
import { withDbQuery } from '@/server/lib/db/query/handler';
import { withFilters, withOrdering, withPagination } from '@/server/lib/db/query/helpers';
import {
    TBooleanFilter,
    TOnConflict,
    TStandardTableOperation,
    TValidTableForFrom,
} from '@/server/lib/db/query/table-operations/types';
import { InferTableTypes } from '@/server/lib/db/table/feature-config/types';
import type { ColumnsSelection } from 'drizzle-orm';
import {
    and,
    eq,
    getTableColumns,
    getTableName,
    InferInsertModel,
    isTable,
    SQL,
    sql,
    Table,
} from 'drizzle-orm';
import type {
    IndexColumn,
    PgInsertBase,
    PgInsertOnConflictDoUpdateConfig,
    PgQueryResultHKT,
} from 'drizzle-orm/pg-core';

/**
 * TableOperationsBuilder - Generic low-level database CRUD operations builder.
 *
 * This class provides type-safe methods for performing basic database operations
 * on any table without knowledge of feature-specific business logic.
 *
 * Use this when:
 * - Building custom complex queries
 * - Need direct table operations
 * - Advanced conflict handling
 *
 * The following methods are available:
 * - createRecord
 * - createManyRecords
 * - getFirstRecord
 * - getManyRecords
 * - updateRecord
 * - updateManyRecords
 * - removeRecord
 * - deactivateRecord
 * - activateRecord
 * - deleteRecord
 *
 * @example
 * ```typescript
 * const tableOps = new TableOperationsBuilder(userTable);
 *
 * const user = await tableOps.createRecord({
 *   data: { name: 'John', email: 'john@example.com' },
 *   returnColumns: ['id', 'name']
 * });
 * ```
 */
export class TableOperationsBuilder<T extends Table> {
    private readonly tableName: string;

    constructor(public table: T) {
        this.tableName = getTableName(this.table);
    }

    // ================================
    // Helpers
    // ================================

    /**
     * Get the columns of the table
     * @returns The columns of the table
     */
    private getColumns(): GetTableColumnDefinitions<T> {
        return getTableColumns(this.table);
    }

    /**
     * Get the column of the table
     * @param column - The column to get
     * @returns The column of the table
     */
    private getColumn(column: GetTableColumnKeys<T>) {
        return this.getColumns()[column];
    }

    /**
     * Build the identifier filters
     * @param identifiers - The identifiers to build the filters from
     * @returns The identifier filters
     */
    private buildIdentifierFilters(identifiers: Array<TBooleanFilter<T>>) {
        return identifiers.map(({ field, value }) => {
            const column = this.getColumn(field);
            return eq(column, value);
        });
    }

    /**
     * Build the columns for select or insert query
     * @param columns - The columns to select
     * @returns The columns for the select or insert query
     */
    private buildSelectColumns<Cols extends Array<GetTableColumnKeys<T>>>(
        columns?: Cols
    ): { [K in Cols[number]]: GetTableColumnDefinitions<T>[K] } {
        const allColumns = this.getColumns();

        if (columns) {
            return columns.reduce(
                (acc, col) => ({ ...acc, [col]: allColumns[col] }),
                {} as { [K in Cols[number]]: GetTableColumnDefinitions<T>[K] }
            );
        }

        return allColumns;
    }

    /**
     * Get the names of the columns
     * @returns The names of the columns
     */
    private getColumnNames(): GetTableColumnKeys<T>[] {
        const columns = this.getColumns();
        return typedKeys(columns);
    }

    /**
     * Get the name of the table
     * @returns The name of the table
     */
    private getTableName() {
        return getTableName(this.table);
    }

    /**
     * Get the operation description
     * @param operation - The operation to get the description for
     * @returns The operation description
     */
    private getOperationDescription(operation: TStandardTableOperation) {
        return `Standard table operation: '${operation}' for table '${this.tableName}'`;
    }

    /**
     * Apply conflict resolution to a dynamic insert query
     * @param query - The dynamic PostgreSQL insert query
     * @param onConflict - The conflict resolution configuration
     * @returns The query with conflict resolution applied
     */
    private buildOnConflict<
        TQueryResult extends PgQueryResultHKT,
        TSelectedFields extends ColumnsSelection | undefined,
        TReturning extends Record<string, unknown> | undefined,
        TExcludedMethods extends string,
    >(
        query: PgInsertBase<T, TQueryResult, TSelectedFields, TReturning, true, TExcludedMethods>,
        onConflict?: TOnConflict<T>
    ): PgInsertBase<T, TQueryResult, TSelectedFields, TReturning, true, TExcludedMethods> {
        if (!onConflict) return query;

        // Handle simple string shortcuts
        if (onConflict === 'ignore') {
            return query.onConflictDoNothing();
        }

        // Default behavior - let database handle conflicts
        if (onConflict === 'fail') {
            return query;
        }

        // Handle object configurations
        if (typeof onConflict === 'object') {
            switch (onConflict.type) {
                case 'ignore': {
                    if (onConflict.target) {
                        const targetColumns = Array.isArray(onConflict.target)
                            ? onConflict.target.map((col) => this.getColumn(col))
                            : [this.getColumn(onConflict.target)];
                        return query.onConflictDoNothing({ target: targetColumns });
                    }
                    return query.onConflictDoNothing();
                }

                // Default behavior
                case 'fail': {
                    return query;
                }

                case 'update': {
                    const targetColumns: IndexColumn[] = Array.isArray(onConflict.target)
                        ? onConflict.target.map((col) => this.getColumn(col))
                        : [this.getColumn(onConflict.target)];

                    // Build set object using excluded values
                    const setObject: Record<string, SQL> = {};
                    if (onConflict.setExcluded) {
                        for (const col of onConflict.setExcluded) {
                            setObject[col as string] = sql.raw(`excluded.${String(col)}`);
                        }
                    }

                    const config: PgInsertOnConflictDoUpdateConfig<any> = {
                        target: targetColumns,
                        set: setObject,
                    };

                    // Add where conditions if provided
                    if (onConflict.where && onConflict.where.length > 0) {
                        const whereConditions = onConflict.where.map((filter) =>
                            eq(this.getColumn(filter.field), filter.value)
                        );
                        config.setWhere = and(...whereConditions);
                    }

                    return query.onConflictDoUpdate(config);
                }

                case 'updateSet': {
                    const targetColumns: IndexColumn[] = Array.isArray(onConflict.target)
                        ? onConflict.target.map((col) => this.getColumn(col))
                        : [this.getColumn(onConflict.target)];

                    const config: PgInsertOnConflictDoUpdateConfig<any> = {
                        target: targetColumns,
                        set: onConflict.set || {},
                    };

                    // Add where conditions if provided
                    if (onConflict.where && onConflict.where.length > 0) {
                        const whereConditions = onConflict.where.map((filter) =>
                            eq(this.getColumn(filter.field), filter.value)
                        );
                        config.setWhere = and(...whereConditions);
                    }

                    return query.onConflictDoUpdate(config);
                }

                case 'updateMixed': {
                    const targetColumns: IndexColumn[] = Array.isArray(onConflict.target)
                        ? onConflict.target.map((col) => this.getColumn(col))
                        : [this.getColumn(onConflict.target)];

                    // Combine excluded values and custom set values
                    const setObject: Record<string, unknown> = { ...(onConflict.set || {}) };
                    if (onConflict.setExcluded) {
                        for (const col of onConflict.setExcluded) {
                            setObject[col as string] = sql.raw(`excluded.${String(col)}`);
                        }
                    }

                    const config: PgInsertOnConflictDoUpdateConfig<any> = {
                        target: targetColumns,
                        set: setObject,
                    };

                    // Add where conditions if provided
                    if (onConflict.where && onConflict.where.length > 0) {
                        const whereConditions = onConflict.where.map((filter) =>
                            eq(this.getColumn(filter.field), filter.value)
                        );
                        config.setWhere = and(...whereConditions);
                    }

                    return query.onConflictDoUpdate(config);
                }
            }
        }

        return query;
    }

    // ================================
    // Get queries
    // ================================

    /**
     * Get first record from the table matching the given identifiers.
     *
     * This method uses Drizzle's `.limit(1)` for optimal performance when you only need
     * a single record. For multiple records, use `getManyRecords` instead.
     *
     * @param identifiers - The identifier filters to match the record
     * @param columns - Optional columns to return (defaults to all columns)
     * @returns The first matching record or null if not found
     *
     * @example
     * ```typescript
     * const record = await tableOps.getFirstRecord({
     *     identifiers: [{ field: 'id', value: '123' }],
     *     columns: ['id', 'name'],
     * });
     * ```
     */
    async getFirstRecord<Cols extends Array<GetTableColumnKeys<T>>>({
        identifiers,
        columns,
    }: {
        identifiers: Array<TBooleanFilter<T>>;
        columns?: Cols;
    }) {
        if (!isTable(this.table)) {
            throw new Error('Model is not a table');
        }

        const filterConditions = this.buildIdentifierFilters(identifiers);
        const selectedColumns = this.buildSelectColumns(columns);

        // Type assertion is safe here: we know table is a regular table (validated by isTable check)
        // and not a data-modifying subquery that would trigger Drizzle's TableLikeHasEmptySelection constraint
        const table = this.table as TValidTableForFrom<T>;

        return withDbQuery({
            queryFn: async () => {
                const [record] = await db
                    .select(selectedColumns)
                    .from(table)
                    .where(and(...filterConditions))
                    .limit(1);

                return record ?? null;
            },
            operation: this.getOperationDescription('getFirstRecord'),
            table: this.tableName,
        });
    }

    /**
     * Get many records from the table
     * @param identifiers - The identifiers of the records
     * @param columns - The columns of the records
     * @param orderBy - The order by of the records
     * @param filters - The filters of the records
     * @param pagination - The pagination of the records
     *
     * @returns The records from the table
     *
     * @example
     * ```typescript
     * const records = await tableOps.getManyRecords({
     *     identifiers: [{ field: 'id', value: '123' }],
     *     columns: ['id', 'name'],
     *     orderBy: { createdAt: 'desc' },
     *     filters: [eq(tag.name, 'Work')],
     *     pagination: { page: 1, pageSize: 10 },
     * });
     * ```
     */
    async getManyRecords<Cols extends Array<GetTableColumnKeys<T>>>({
        identifiers,
        columns,
        orderBy,
        filters,
        pagination = { page: 1, pageSize: 25 },
    }: {
        columns?: Cols;
        identifiers: Array<TBooleanFilter<T>>;
        filters?: (SQL | undefined)[];
        orderBy?: Partial<Record<GetTableColumnKeys<T>, 'asc' | 'desc'>>;
        pagination?: {
            page?: number;
            pageSize?: number;
        };
    }) {
        // check if the table is a table
        if (!isTable(this.table)) {
            throw new Error('Model is not a table');
        }

        // Type assertion is safe here: we know table is a regular table (validated by isTable check)
        // and not a data-modifying subquery that would trigger Drizzle's TableLikeHasEmptySelection constraint
        const table = this.table as TValidTableForFrom<T>;

        let query = db.select(this.buildSelectColumns(columns)).from(table).$dynamic();

        // filters
        const idFilters = this.buildIdentifierFilters(identifiers);
        query = withFilters(query, [...idFilters, ...(filters ?? [])]);

        // Apply ordering if specified
        if (orderBy) {
            query = withOrdering(query, orderBy, (column) => this.getColumn(column));
        }

        // Apply pagination
        if (pagination) {
            query = withPagination(query, {
                page: pagination.page ?? 1,
                pageSize: pagination.pageSize ?? 25,
            });
        }

        return withDbQuery({
            queryFn: async () => await query,
            operation: this.getOperationDescription('getManyRecords'),
            table: this.tableName,
        });
    }

    // ================================
    // Update queries
    // ================================

    /**
     * Update the record in the table
     * @param data - The data to update the record with
     * @param identifiers - The identifiers of the record
     * @param returnColumns - The columns to return
     * @returns The updated record from the table
     */
    async updateRecord<Cols extends Array<GetTableColumnKeys<T>>>({
        data,
        identifiers,
        returnColumns,
    }: {
        data: InferTableTypes<T, 'update'>;
        identifiers: Array<TBooleanFilter<T>>;
        returnColumns?: Cols;
    }) {
        const filterConditions = this.buildIdentifierFilters(identifiers);
        const columns = this.buildSelectColumns(returnColumns);

        return withDbQuery({
            queryFn: async () => {
                const updatedRecord = await db
                    .update(this.table)
                    .set(data)
                    .where(and(...filterConditions))
                    .returning(columns);

                return updatedRecord[0] ?? null;
            },
            operation: this.getOperationDescription('updateRecord'),
            table: this.tableName,
        });
    }

    /**
     * Update many records in the table
     * @param data - The data to update the records with
     * @param identifiers - The identifiers of the records
     * @param returnColumns - The columns to return
     * @returns The updated records from the table
     */
    async updateManyRecords<Cols extends Array<GetTableColumnKeys<T>>>({
        data,
        identifiers,
        returnColumns,
    }: {
        data: Partial<InferInsertModel<T>>;
        identifiers: Array<TBooleanFilter<T>>;
        returnColumns?: Cols;
    }) {
        const filterConditions = this.buildIdentifierFilters(identifiers);
        const columns = this.buildSelectColumns(returnColumns);

        return withDbQuery({
            queryFn: async () => {
                return await db
                    .update(this.table)
                    .set(data)
                    .where(and(...filterConditions))
                    .returning(columns);
            },
            operation: this.getOperationDescription('updateManyRecords'),
            table: this.tableName,
        });
    }

    // ================================
    // Create queries
    // ================================

    /**
     * Create a record in the table
     * @param data - The data to create the record with
     * @returns The created record from the table
     */
    async createRecord<Cols extends Array<GetTableColumnKeys<T>>>({
        data,
        returnColumns,
        onConflict,
    }: {
        data: InferTableTypes<T, 'insert'>;
        returnColumns?: Cols;
        onConflict?: TOnConflict<T>;
    }): Promise<{ [K in Cols[number]]: T['_']['columns'][K]['_']['data'] }> {
        const columns = this.buildSelectColumns(returnColumns);

        // base query
        // Type assertion: InferTableTypes<T, 'insert'> is structurally compatible with Drizzle's insert type
        const baseQuery = db
            .insert(this.table)
            .values(data as InferInsertModel<T>)
            .$dynamic();

        // build on conflict
        const query = this.buildOnConflict(baseQuery, onConflict);

        // returning cols
        const queryWithReturning = query.returning(columns);

        // execute query
        return withDbQuery({
            queryFn: async () => {
                const newRecord = await queryWithReturning;

                return newRecord[0];
            },
            operation: this.getOperationDescription('createRecord'),
            table: this.tableName,
        });

        // return queryFnHandler({
        //     fn: async () => {
        //         const query = db.insert(this.table).values(data).returning(columns).$dynamic();
        //         // const queryWithConflict =
        //         const newRecord = await this.buildOnConflict(query, onConflict);
        //         return newRecord[0] ?? null;
        //     },
        //     operation: 'create record for table ' + this.getTableName(),
        // });

        // const _query = db.insert(this.table).values(data).returning(columns).$dynamic();

        // const queryWithConflict = this.buildOnConflict(query, onConflict);

        // return await queryHandler({
        //     query: queryWithConflict,
        //     operation: 'create record for table ' + this.getTableName(),
        // });

        // return queryHandler({
        //     query: async () => {
        //         const newRecord = await queryWithConflict;
        //         // The query layer returns object or null. The service layer will handle the error if the record is not created
        //         return newRecord[0] ?? null;
        //     },
        //     operation: 'create record for table ' + this.getTableName(),
        // });

        // try {
        //     const newRecord = await queryWithConflict;
        //     // The query layer returns object or null. The service layer will handle the error if the record is not created
        //     return newRecord[0] ?? null;
        // } catch (error) {
        //     // if (e instanceof PostgresError) {
        //     //     //
        //     // }
        //     if (error instanceof DrizzleQueryError) {
        //         const drizzleError = error;
        //         console.log(drizzleError.query);
        //         if (drizzleError.cause instanceof postgres.PostgresError) {
        //             const postgresError = drizzleError.cause;
        //             console.log('errro here', postgresError.code, postgresError.constraint_name);
        //             console.log('errro here', postgresError);
        //         }
        //     }
        //     // console.log(e);
        // }
    }

    /**
     * Create many records in the table
     * @param data - The data to create the records with (array of objects)
     * @param overrideValues - The values to override the data with
     * @param returnColumns - The columns to return
     * @param onConflict - The conflict resolution strategy
     * @returns The created records from the table
     */
    async createManyRecords<Cols extends Array<GetTableColumnKeys<T>>>({
        data,
        returnColumns,
        overrideValues,
        onConflict = 'ignore',
    }: {
        data: Array<InferTableTypes<T, 'insert'>>;
        overrideValues?: Partial<InferInsertModel<T>>;
        returnColumns?: Cols;
        onConflict?: TOnConflict<T>;
    }) {
        let localData = data;

        // override the data with the override values
        if (overrideValues) {
            localData = data.map((item) => ({ ...item, ...overrideValues }));
        }

        const columns = this.buildSelectColumns(returnColumns);

        // Build dynamic query with conflict resolution
        // Type assertion: InferTableTypes<T, 'insert'> is structurally compatible with Drizzle's insert type
        let query = db
            .insert(this.table)
            .values(localData as Array<InferInsertModel<T>>)
            .$dynamic();
        query = this.buildOnConflict(query, onConflict);

        return withDbQuery({
            queryFn: async () => await query.returning(columns),
            operation: this.getOperationDescription('createManyRecords'),
            table: this.tableName,
        });
    }

    // ================================
    // Remove queries
    // ================================

    /**
     * Remove a record from the table. Soft delete is used by default.
     * @param identifiers - The identifiers of the record
     * @returns The removed record from the table
     */
    async removeRecord<Cols extends Array<GetTableColumnKeys<T>>>({
        identifiers,
        softDelete = true,
        returnColumns,
    }: {
        identifiers: Array<TBooleanFilter<T>>;
        returnColumns?: Cols;
        softDelete?: boolean;
    }) {
        if (softDelete) {
            return this.deactivateRecord({ identifiers, returnColumns });
        } else {
            return this.deleteRecord({ identifiers, returnColumns });
        }
    }

    /**
     * Deactivate a record in the table. Soft delete is used by default.
     * @param identifiers - The identifiers of the record
     * @param returnColumns - The columns to return
     * @returns
     */
    async deactivateRecord<Cols extends Array<GetTableColumnKeys<T>>>({
        identifiers,
        returnColumns,
    }: {
        identifiers: Array<TBooleanFilter<T>>;
        returnColumns?: Cols;
    }) {
        const filterConditions = this.buildIdentifierFilters(identifiers);
        const columns = this.buildSelectColumns(returnColumns);

        return withDbQuery({
            queryFn: async () => {
                const deactivatedRecord = await db
                    .update(this.table)
                    .set({ isActive: false })
                    .where(and(...filterConditions))
                    .returning(columns);

                return deactivatedRecord[0] ?? null;
            },
            operation: this.getOperationDescription('deactivateRecord'),
            table: this.tableName,
        });
    }

    /**
     * Activate a record in the table.
     * @param identifiers - The identifiers of the record
     * @param returnColumns - The columns to return
     * @returns
     */
    async activateRecord<Cols extends Array<GetTableColumnKeys<T>>>({
        identifiers,
        returnColumns,
    }: {
        identifiers: Array<TBooleanFilter<T>>;
        returnColumns?: Cols;
    }) {
        const filterConditions = this.buildIdentifierFilters(identifiers);
        const columns = this.buildSelectColumns(returnColumns);

        return withDbQuery({
            queryFn: async () => {
                const activatedRecord = await db
                    .update(this.table)
                    .set({ isActive: true })
                    .where(and(...filterConditions))
                    .returning(columns);

                return activatedRecord[0] ?? null;
            },
            operation: this.getOperationDescription('activateRecord'),
            table: this.tableName,
        });
    }

    /**
     * Delete a record from the table.
     * @param identifiers - The identifiers of the record
     * @param returnColumns - The columns to return
     * @returns
     */
    async deleteRecord<Cols extends Array<GetTableColumnKeys<T>>>({
        identifiers,
        returnColumns,
    }: {
        identifiers: Array<TBooleanFilter<T>>;
        returnColumns?: Cols;
    }) {
        const filterConditions = this.buildIdentifierFilters(identifiers);
        const columns = this.buildSelectColumns(returnColumns);

        return withDbQuery({
            queryFn: async () => {
                const deletedRecord = await db
                    .delete(this.table)
                    .where(and(...filterConditions))
                    .returning(columns);

                return deletedRecord[0] ?? null;
            },
            operation: this.getOperationDescription('deleteRecord'),
            table: this.tableName,
        });
    }
}
