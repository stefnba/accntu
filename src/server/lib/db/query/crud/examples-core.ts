import { tagSchemas } from '@/features/tag/schemas';
import { tag } from '@/server/db/tables';
import { createFeatureQueries } from '@/server/lib/db/query/builder';
import { eq, InferInsertModel } from 'drizzle-orm';
import { alphabet, generateRandomString } from 'oslo/crypto';

const name = () => generateRandomString(10, alphabet('a-z'));
const userId = 'rH3N756BtCOMAPwW0XO59kmWGx64tvSo';

const queries = createFeatureQueries.registerSchema(tagSchemas).registerCoreQueries(tag, {
    idFields: ['id'],
    userIdField: 'userId',
    returnColumns: ['id', 'name'],
    allowedUpsertColumns: ['name'],
    queryConfig: {
        getMany: {
            filters: (filters) => [eq(tag.name, filters?.search ?? '')],
            orderBy: {
                name: 'desc',
                createdAt: 'desc',
            },
        },
    },
});
// .overwriteQuery('getMany', {
//     fn: async (input) => {
//         return {
//             ...input,
//         };
//     },
// });

// queries.queries.getMany({
//     // filters: { puddel: 'vbsxaydqik' },
//     userId,
//     pagination: { page: 1, pageSize: 10 },
// });

// const adfasdf = await queries.queries.getById({ ids: { id: 'ddd' }, userId: 'eee' });
const create = await queries.queries.create({
    data: { name: name(), userId: userId },
});
// console.log('create', create);
const many = await queries.queries.getMany({
    userId,
    pagination: { pageSize: 10 },
    filters: {
        search: 'd',
    },
    // filters: {
    //     hallo: 'vbsxaydqik',
    // },
});
// const one = await queries.queries.getById({ ids: { id: create.id }, userId: userId });

// console.log('one', one);
// const update = await queries.queries.updateById({
//     ids: { id: 'ddd' },
//     userId: 'eee',
//     data: { name: 'fff' },
// });

queries.queries.getById({ ids: { id: create.id }, userId: userId });

console.log(many);

type TTest = keyof InferInsertModel<typeof tag>;

process.exit(0);
