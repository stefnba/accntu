
/**
 * Default drizzle fields to omit from upsert schemas. These will be set in the query itself.
 */
export const DEFAULT_UPSERT_OMIT_FIELDSOld = {
    id: true,
    updatedAt: true,
    createdAt: true,
    userId: true,
    isActive: true,
} as const;



export const CORE_CRUD_OPERATIONS = ['getById', 'getMany', 'create', 'updateById', 'removeById'] as const;
