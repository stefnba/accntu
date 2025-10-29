import { tagSchemas } from '@/features/tag/schemas';
import { tag } from '@/server/db/tables';
import { createFeatureQueries } from './factory';

const b = createFeatureQueries(tag)
    .registerSchema(tagSchemas)
    .standardQueries({
        idColumns: ['id'],
        userIdColumn: 'userId',
        allowAllColumns: true,
        defaults: {
            idFilters: { isActive: true },
            returnColumns: ['id', 'name', 'color', 'isActive', 'userId'],
            allowedUpsertColumns: ['name', 'color', 'description', 'userId'],
            // upsertSchema: (baseSchema) => baseSchema.pick({name: true, color: true, description: true}),
        },
    })
    .create({
        // allowedColumns: ['name', 'color'],
        // returnColumns: ['id', 'name', 'color', 'createdAt'],
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
        name: 'test1111adddflkasdf',
        color: '#111111',
        description: 'dddd',
    },
    userId: 'IFzBheRxRYED8lzSD1veak9JRRts5Bxv',
});

const fetchedTag = await b.queries.getById({
    ids: { id: aa.id },
    userId: 'IFzBheRxRYED8lzSD1veak9JRRts5Bxv',
});

const bb = await b.queries.removeById({
    ids: { id: aa.id },
    userId: '123',
});

console.log('Created tag:', aa);
console.log('Fetched tag:', fetchedTag);
console.log('Removed tag:', bb);
