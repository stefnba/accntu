import { tag } from '@/server/db/tables';
import { CrudQueryBuilder } from '@/server/lib/db/query/crud/core';
import { alphabet, generateRandomString } from 'oslo/crypto';

const queryBuilder = new CrudQueryBuilder(tag);

const name = () => generateRandomString(10, alphabet('a-z'));
const userId = 'rH3N756BtCOMAPwW0XO59kmWGx64tvSo';

const createOne = await queryBuilder.createRecord({
    data: {
        name: name(),
        userId: userId,
    },
    returnColumns: ['id', 'name', 'userId'],
});

console.log(createOne);

const createFiveRecords = await queryBuilder.createManyRecords({
    data: [
        {
            name: name(),
            userId: userId,
        },
        {
            name: name(),
            userId: userId,
        },
        {
            name: name(),
            userId: userId,
        },
        {
            name: name(),
            userId: userId,
        },
        {
            name: name(),
            userId: userId,
        },
    ],
    overrideValues: {
        description: 'test',
    },
    returnColumns: ['id', 'name', 'userId'],
});

// console.log(createFiveRecords);

const aaa = await queryBuilder.getFirstRecord({
    identifiers: [{ field: 'id', value: createFiveRecords[0].id }],
    // columns: ['id', 'name', 'userId', 'description'],
});

console.log(aaa);

const bbb = await queryBuilder.getManyRecords({
    identifiers: [{ field: 'userId', value: userId }],
    columns: ['id'],
});

console.log(bbb);

process.exit(0);
