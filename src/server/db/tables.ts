/**
 * This file is a central import for all table schemas.
 * It is used to import all table schemas into the server.
 */

// feature tables
export * from '@/features/bank/server/db/tables';
export * from '@/features/bucket/server/db/tables';
export * from '@/features/budget/server/db/tables';
export * from '@/features/label/server/db/tables';
export * from '@/features/participant/server/db/tables';
export * from '@/features/tag/server/db/tables';
export * from '@/features/transaction-fx/server/db/tables';
export * from '@/features/transaction-import/server/db/tables';
export * from '@/features/transaction/server/db/tables';

// auth tables
export * from '@/lib/auth/server/db/tables';
