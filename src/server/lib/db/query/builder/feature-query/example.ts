import { tagSchemas } from '@/features/tag/schemas';
import { tag } from '@/server/db/tables';
import { createFeatureQueries } from './factory';

const b = createFeatureQueries(tag)
    .registerSchema(tagSchemas)
    .standardQueries({
        idColumns: ['id'],
        userIdColumn: 'userId',
        defaultIdFilters: { isActive: true },
    })
    .create({
        allowedColumns: ['name', 'color'],
        returnColumns: ['id', 'name', 'color', 'createdAt'],
    })
    .getById({
        returnColumns: ['id', 'name', 'color', 'userId'],
    })
    .done()
    .addQuery('removeById', ({ tableOps }) => ({
        fn: async (input) => {
            await tableOps.removeRecord({
                identifiers: [{ field: 'id', value: input.ids.id }],
            });
        },
    }));

const aa = await b.queries.create({
    data: {
        name: 'test',
        color: '#111111',
    },
    userId: '123',
});

const fetchedTag = await b.queries.getById({
    ids: { id: aa.id },
    userId: '123',
});

const bb = await b.queries.removeById({
    ids: { id: aa.id },
    userId: '123',
});

console.log('Created tag:', aa);
console.log('Fetched tag:', fetchedTag);
console.log('Removed tag:', bb);
