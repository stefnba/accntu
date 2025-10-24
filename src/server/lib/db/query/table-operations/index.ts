/**
 * Table Operations - Generic low-level database CRUD operations.
 *
 * This module provides the TableOperationsBuilder class for direct table manipulation
 * without feature-specific business logic.
 *
 * @example
 * ```typescript
 * import { TableOperationsBuilder } from '@/server/lib/db/query/table-operations';
 *
 * const tableOps = new TableOperationsBuilder(userTable);
 * const user = await tableOps.createRecord({
 *   data: { name: 'John', email: 'john@example.com' }
 * });
 * ```
 */

export { TableOperationsBuilder } from './core';
export type {
    TBooleanFilter,
    TOnConflict,
    TTableColumns,
    TValidTableForFrom,
    RequiredOnly,
    TByIdInput,
} from './types';
