import { SYSTEM_FIELDS } from '@/server/lib/db/table/system-fields/config';
import { InferSelectModel } from 'drizzle-orm';
import { PgTable, pgTable } from 'drizzle-orm/pg-core';

// ================================
// Core
// ================================

export { SYSTEM_FIELDS, SYSTEM_FIELDS_KEYS } from '@/server/lib/db/table/system-fields/config';
export { createSystemTableFields } from '@/server/lib/db/table/system-fields/core';

// ================================
// Types
// ================================

export type SystemTableFieldKeys = keyof typeof SYSTEM_FIELDS;
export type SystemTable = PgTable;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _ = pgTable('common_table', SYSTEM_FIELDS);
export type SystemTableField = InferSelectModel<typeof _>;
