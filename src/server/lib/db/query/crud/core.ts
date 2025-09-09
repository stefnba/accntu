import { typedKeys } from '@/lib/utils';
import { db } from '@/server/db';
import { withFilters, withOrdering, withPagination } from '@/server/lib/db/query/crud/helpers';
import {
    TBooleanFilter,
    TTableColumns,
    TValidTableForFrom,
} from '@/server/lib/db/query/crud/types';
import {
    and,
    eq,
    getTableColumns,
    getTableName,
    InferInsertModel,
    isTable,
    SQL,
    Table,
} from 'drizzle-orm';

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

    private getColumn(column: keyof T['_']['columns']) {
        return this.getColumns()[column];
    }

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
        throwOnNotFound,
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

        if (throwOnNotFound && records.length === 0) {
            throw new Error(`Record not found from table '${getTableName(this.table)}'`);
        }

        // todo check if this is correct
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
        return updatedRecord[0];
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
    }: {
        data: InferInsertModel<T>;
        returnColumns?: Cols;
    }) {
        const columns = this.buildSelectColumns(returnColumns);
        const newRecord = await db.insert(this.table).values(data).returning(columns);
        return newRecord[0];
    }

    /**
     * Create many records in the table
     * @param data - The data to create the records with (array of objects)
     * @param overrideValues - The values to override the data with
     * @param returnColumns - The columns to return
     * @returns The created records from the table
     */
    async createManyRecords<Cols extends Array<TTableColumns<T>>>({
        data,
        returnColumns,
        overrideValues,
    }: {
        data: Array<InferInsertModel<T>>;
        overrideValues?: Partial<InferInsertModel<T>>;
        returnColumns?: Cols;
    }) {
        let localData = data;

        // override the data with the override values
        if (overrideValues) {
            localData = data.map((item) => ({ ...item, ...overrideValues }));
        }

        const columns = this.buildSelectColumns(returnColumns);
        return db.insert(this.table).values(localData).returning(columns);
    }

    // ================================
    // Remove queries
    // ================================

    /**
     * Remove a record from the table. Soft delete is used by default.
     * @param identifiers - The identifiers of the record
     * @returns The removed record from the table
     */
    async removeRecord({
        identifiers,
        softDelete = true,
    }: {
        identifiers: Array<TBooleanFilter<T>>;
        softDelete?: boolean;
    }) {
        const filterConditions = this.buildIdentifierFilters(identifiers);

        if (softDelete) {
            // if softDelete is true, update the record to set isActive to false
            await db
                .update(this.table)
                .set({ isActive: false, updatedAt: new Date() })
                .where(and(...filterConditions));
        } else {
            // if softDelete is false, delete the record
            await db.delete(this.table).where(and(...filterConditions));
        }
    }
}
