import { COMMON_FIELDS } from '@/server/lib/db/table/config';
import { InferSelectModel } from 'drizzle-orm';
import { PgTable, pgTable } from 'drizzle-orm/pg-core';

// ================================
// Core
// ================================

export { createCommonTableFields } from '@/server/lib/db/table/core';

// ================================
// Types
// ================================

export type CommonTableFieldKeys = keyof typeof COMMON_FIELDS;
export type CommonTable = PgTable;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _ = pgTable('common_table', COMMON_FIELDS);
export type CommonTableField = InferSelectModel<typeof _>;
