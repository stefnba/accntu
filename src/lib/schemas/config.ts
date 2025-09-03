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

export const CORE_CRUD_OPERATIONS = [
    // retrieve
    'getById',
    'getMany',
    // create
    'create',
    'createMany',
    // update
    'updateById',
    'updateManyByIds',
    // remove (soft delete)
    'removeById',
    'removeManyByIds',
    // hard delete (permanent delete)
    'deleteById',
    'deleteManyByIds',
] as const;
