import { db } from '@/server/db/client';
import { SQL, and, eq, sql } from 'drizzle-orm';
import { PgColumn, PgSelect, PgTable } from 'drizzle-orm/pg-core';

export const getFilterOptions = async (
    table: PgTable,
    valueCol: PgColumn,
    filter?: SQL,
    joinTable?: PgTable,
    labelCol?: PgColumn,
    onCols?: [PgColumn, PgColumn]
) => {
    if (!joinTable && !labelCol) {
        return db
            .select({
                value: sql<string | null>`${valueCol}`,
                label: sql<string>`${valueCol}`,
                count: sql<number>`cast(count(*) as int)`
            })
            .from(table)
            .where(filter)
            .groupBy(valueCol)
            .orderBy(sql<string>`3 DESC`);
    }

    if (!joinTable || !labelCol || !onCols) {
        throw new Error('joinTable, labelCol, and onCols must be provided');
    }

    return db
        .select({
            value: valueCol,
            label: sql<string>`COALESCE(${labelCol}, 'None')`,
            count: sql<number>`cast(count(*) as int)`
        })
        .from(table)
        .where(filter)

        .leftJoin(joinTable, eq(onCols[0], onCols[1]))
        .groupBy(valueCol, labelCol)
        .orderBy(sql<string>`3 DESC`);
};
