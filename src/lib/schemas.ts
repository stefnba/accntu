/*
Include some basic CRUD type and schemas for use in queries.
*/

import { z } from 'zod';

// ===========================
// Schemas
// ===========================

export const endpointSelectSchema = z.object({
    id: z.string(),
});

// ===========================
// Types
// ===========================

/**
 * Update record schema
 */
export type TQueryUpdateRecord<T> = {
    id: string;
    data: Partial<T>;
    userId: string;
};

/**
 * Insert record schema
 */
export type TQueryInsertRecord<T> = {
    data: T;
    userId: string;
};

/**
 * Select record schema
 */
export type TQuerySelectRecordByIdAndUser<TFilter extends object | undefined = undefined> = {
    id: string;
    userId: string;
    filters?: TFilter;
};

/**
 * Select multiple records from user schema
 */
export type TQuerySelectRecordsFromUser<TFilter extends object = {}> = {
    userId: string;
    filters?: TFilter;
};

/**
 * Delete record schema
 */
export type TQueryDeleteRecord<TFilter extends object | undefined = undefined> = {
    id: string;
    userId: string;
    filters?: TFilter;
};
