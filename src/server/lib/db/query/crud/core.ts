import { typedKeys } from '@/lib/utils';
import { db } from '@/server/db';
import {
    TBooleanFilter,
    TOnConflict,
    TTableColumns,
    TValidTableForFrom,
} from '@/server/lib/db/query/crud/types';
import { withDbQuery } from '@/server/lib/db/query/handler';
import { withFilters, withOrdering, withPagination } from '@/server/lib/db/query/helpers';
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

export class CrudQueryBuilder<T extends Table> {
    constructor(public table: T) {}

    // ================================
    // Helpers
    // ================================

    /**
     * Get the columns of the table
     * @returns The columns of the table
     */
    private getColumns(): T['_']['columns'] {
        return getTableColumns(this.table);
    }

    /**
     * Get the column of the table
     * @param column - The column to get
     * @returns The column of the table
     */
    private getColumn(column: keyof T['_']['columns']) {
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
    private buildSelectColumns<Cols extends Array<keyof T['_']['columns']>>(
        columns?: Cols
    ): { [K in Cols[number]]: T['_']['columns'][K] } {
        const allColumns = this.getColumns();

        if (columns) {
            return columns.reduce(
                (acc, col) => ({ ...acc, [col]: allColumns[col] }),
                {} as { [K in Cols[number]]: T['_']['columns'][K] }
            );
        }

        return allColumns;
    }

    /**
     * Get the names of the columns
     * @returns The names of the columns
     */
    private getColumnNames() {
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
     * Get the record from the table
     * @param identifiers - The identifiers of the record
     * @param columns - The columns of the record
     * @param throwOnNotFound - Whether to throw an error if the record is not found
     * @returns The record from the table
     */
    async getFirstRecord<Cols extends Array<TTableColumns<T>>>({
        identifiers,
        columns,
    }: {
        identifiers: Array<TBooleanFilter<T>>;
        columns?: Cols;
        throwOnNotFound?: boolean;
    }) {
        // Normal getManyRecords with pageSize 1
        const records = await this.getManyRecords({
            identifiers,
            columns,
            pagination: { page: 1, pageSize: 1 },
        });

        // The query layer returns object or null. The service layer will handle the error if the record is not found
        return records[0] ?? null;
    }

    /**
     * Get many records from the table
     * @param identifiers - The identifiers of the records
     * @param columns - The columns of the records
     * @param orderBy - The order by of the records
     * @param filters - The filters of the records
     * @param pagination - The pagination of the records
     */
    async getManyRecords<Cols extends Array<TTableColumns<T>>>({
        identifiers,
        columns,
        orderBy,
        filters,
        pagination = { page: 1, pageSize: 25 },
    }: {
        columns?: Cols;
        identifiers: Array<TBooleanFilter<T>>;
        filters?: (SQL | undefined)[];
        orderBy?: Partial<Record<keyof T['_']['columns'], 'asc' | 'desc'>>;
        pagination?: {
            page?: number;
            pageSize?: number;
        };
    }) {
        // check if the table is a table
        if (!isTable(this.table)) {
            throw new Error('Model is not a table');
        }

        // Type assertion is safe here: we know _model is a regular table (validated by isTable check)
        // and not a data-modifying subquery that would trigger Drizzle's TableLikeHasEmptySelection constraint
        let query = db
            .select(this.buildSelectColumns(columns))
            .from(this.table as TValidTableForFrom<T>)
            .$dynamic();

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

        return await query;
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
    async updateRecord<Cols extends Array<TTableColumns<T>>>({
        data,
        identifiers,
        returnColumns,
    }: {
        data: Partial<InferInsertModel<T>>;
        identifiers: Array<TBooleanFilter<T>>;
        returnColumns?: Cols;
    }) {
        const filterConditions = this.buildIdentifierFilters(identifiers);
        const updatedRecord = await db
            .update(this.table)
            .set(data)
            .where(and(...filterConditions))
            .returning(this.buildSelectColumns(returnColumns));

        // The query layer returns object or null. The service layer will handle the error if the record is not found
        return updatedRecord[0] ?? null;
    }

    /**
     * Update many records in the table
     * @param data - The data to update the records with
     * @param identifiers - The identifiers of the records
     * @param returnColumns - The columns to return
     * @returns The updated records from the table
     */
    async updateManyRecords<Cols extends Array<TTableColumns<T>>>({
        data,
        identifiers,
        returnColumns,
    }: {
        data: Partial<InferInsertModel<T>>;
        identifiers: Array<TBooleanFilter<T>>;
        returnColumns?: Cols;
    }) {
        const filterConditions = this.buildIdentifierFilters(identifiers);
        return db
            .update(this.table)
            .set(data)
            .where(and(...filterConditions))
            .returning(this.buildSelectColumns(returnColumns));
    }

    // ================================
    // Create queries
    // ================================

    /**
     * Create a record in the table
     * @param data - The data to create the record with
     * @returns The created record from the table
     */
    async createRecord<Cols extends Array<TTableColumns<T>>>({
        data,
        returnColumns,
        onConflict,
    }: {
        data: InferInsertModel<T>;
        returnColumns?: Cols;
        onConflict?: TOnConflict<T>;
    }): Promise<{ [K in Cols[number]]: T['_']['columns'][K]['_']['data'] } | null> {
        const columns = this.buildSelectColumns(returnColumns);

        const baseQuery = db.insert(this.table).values(data).$dynamic();
        const query = this.buildOnConflict(baseQuery, onConflict);
        const queryWithReturning = query.returning(columns);

        return withDbQuery({
            queryFn: async () => {
                const newRecord = await queryWithReturning;
                return newRecord[0] ?? null;
            },
            operation: 'create record for table ' + this.getTableName(),
        });
        const newRecord = await queryWithReturning;

        return newRecord[0] ?? null;

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
    async createManyRecords<Cols extends Array<TTableColumns<T>>>({
        data,
        returnColumns,
        overrideValues,
        onConflict = 'ignore',
    }: {
        data: Array<InferInsertModel<T>>;
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
        let query = db.insert(this.table).values(localData).$dynamic();
        query = this.buildOnConflict(query, onConflict);

        return await query.returning(columns);
    }

    // ================================
    // Remove queries
    // ================================

    /**
     * Remove a record from the table. Soft delete is used by default.
     * @param identifiers - The identifiers of the record
     * @returns The removed record from the table
     */
    async removeRecord<Cols extends Array<TTableColumns<T>>>({
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
    async deactivateRecord<Cols extends Array<TTableColumns<T>>>({
        identifiers,
        returnColumns,
    }: {
        identifiers: Array<TBooleanFilter<T>>;
        returnColumns?: Cols;
    }) {
        const filterConditions = this.buildIdentifierFilters(identifiers);
        const columns = this.buildSelectColumns(returnColumns);

        const deactivatedRecord = await db
            .update(this.table)
            .set({ isActive: false })
            .where(and(...filterConditions))
            .returning(columns);

        // The query layer returns object or null. The service layer will handle the error if the record is not created
        return deactivatedRecord[0] ?? null;
    }

    /**
     * Activate a record in the table.
     * @param identifiers - The identifiers of the record
     * @param returnColumns - The columns to return
     * @returns
     */
    async activateRecord<Cols extends Array<TTableColumns<T>>>({
        identifiers,
        returnColumns,
    }: {
        identifiers: Array<TBooleanFilter<T>>;
        returnColumns?: Cols;
    }) {
        const filterConditions = this.buildIdentifierFilters(identifiers);
        const columns = this.buildSelectColumns(returnColumns);

        const activatedRecord = await db
            .update(this.table)
            .set({ isActive: true })
            .where(and(...filterConditions))
            .returning(columns);

        // The query layer returns object or null. The service layer will handle the error if the record is not created
        return activatedRecord[0] ?? null;
    }

    /**
     * Delete a record from the table.
     * @param identifiers - The identifiers of the record
     * @param returnColumns - The columns to return
     * @returns
     */
    async deleteRecord<Cols extends Array<TTableColumns<T>>>({
        identifiers,
        returnColumns,
    }: {
        identifiers: Array<TBooleanFilter<T>>;
        returnColumns?: Cols;
    }) {
        const filterConditions = this.buildIdentifierFilters(identifiers);
        const columns = this.buildSelectColumns(returnColumns);

        const deletedRecord = await db
            .delete(this.table)
            .where(and(...filterConditions))
            .returning(columns);

        // The query layer returns object or null. The service layer will handle the error if the record is not created
        return deletedRecord[0] ?? null;
    }
}
