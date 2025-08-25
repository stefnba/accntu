/**
 * Supported core CRUD queries keys
 */
export const CORE_CRUD_QUERIES_KEYS = [
    // retrieve
    'getMany',
    'getById',
    // create
    'create',
    'createMany',
    // update
    'updateById',
    'updateManyByIds',
    // soft delete
    'removeById',
    'removeManyByIds',
    // hard delete
    'deleteById',
    'deleteManyByIds',
] as const;
