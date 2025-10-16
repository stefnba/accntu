import { tag } from '@/server/db/tables';
import { CrudQueryBuilder } from './core';

async function runExamples() {
    const queries = new CrudQueryBuilder(tag);

    // Example 1: Simple ignore conflict
    const example1 = await queries.createRecord({
        data: {
            name: 'Tag1',
            userId: 'NJKkGxtM7z4UPipVCyq6l6gaJlxH6ZES',
            color: '#ff0000',
        },
        // returnColumns: ['id', 'name', 'color'],
        // onConflict: {
        //     type: 'update',
        //     target: ['name'],
        //     setExcluded: ['name'],
        // },
    });
    console.log('Example 1 - Simple ignore:', example1);

    // // Example 2: Ignore with specific target columns
    // const example2 = await queries.createRecord({
    //     data: {
    //         name: 'Tag2',
    //         userId: 'NJKkGxtM7z4UPipVCyq6l6gaJlxH6ZES',
    //         color: '#00ff00',
    //     },
    //     returnColumns: ['id', 'name', 'color'],
    //     onConflict: {
    //         type: 'ignore',
    //         target: ['name', 'userId'],
    //     },
    // });
    // console.log('Example 2 - Ignore with target:', example2);

    // // Example 3: Update with excluded values (full upsert)
    // const example3 = await queries.createRecord({
    //     data: {
    //         name: 'Tag3',
    //         userId: 'NJKkGxtM7z4UPipVCyq6l6gaJlxH6ZES',
    //         color: '#0000ff',
    //     },
    //     returnColumns: ['id', 'name', 'color'],
    //     onConflict: {
    //         type: 'update',
    //         target: ['name', 'userId'],
    //         setExcluded: ['color'], // Use excluded.color on conflict
    //     },
    // });
    // console.log('Example 3 - Update with excluded:', example3);

    // // Example 4: Update with custom set values
    // const example4 = await queries.createRecord({
    //     data: {
    //         name: 'Tag4',
    //         userId: 'NJKkGxtM7z4UPipVCyq6l6gaJlxH6ZES',
    //         color: '#ffff00',
    //     },
    //     returnColumns: ['id', 'name', 'color'],
    //     onConflict: {
    //         type: 'updateSet',
    //         target: ['name', 'userId'],
    //         set: {
    //             color: '#purple', // Custom color on conflict
    //         },
    //     },
    // });
    // console.log('Example 4 - Update with custom set:', example4);

    // // Example 5: Mixed update (excluded + custom values)
    // const example5 = await queries.createRecord({
    //     data: {
    //         name: 'Tag5',
    //         userId: 'NJKkGxtM7z4UPipVCyq6l6gaJlxH6ZES',
    //         color: '#00ffff',
    //         description: 'Original description',
    //     },
    //     returnColumns: ['id', 'name', 'color', 'description'],
    //     onConflict: {
    //         type: 'updateMixed',
    //         target: ['name', 'userId'],
    //         setExcluded: ['color'], // Use excluded.color
    //         set: {
    //             description: 'Updated description', // Custom description
    //         },
    //     },
    // });
    // console.log('Example 5 - Mixed update:', example5);

    // // Example 6: Bulk insert with conflict resolution
    // const bulkData = [
    //     {
    //         name: 'BulkTag1',
    //         userId: 'NJKkGxtM7z4UPipVCyq6l6gaJlxH6ZES',
    //         color: '#111111',
    //     },
    //     {
    //         name: 'BulkTag2',
    //         userId: 'NJKkGxtM7z4UPipVCyq6l6gaJlxH6ZES',
    //         color: '#222222',
    //     },
    // ];

    // const example6 = await queries.createManyRecords({
    //     data: bulkData,
    //     returnColumns: ['id', 'name', 'color'],
    //     onConflict: {
    //         type: 'update',
    //         target: ['name', 'userId'],
    //         setExcluded: ['color'],
    //     },
    // });
    // console.log('Example 6 - Bulk insert with upsert:', example6);

    // console.log('All examples completed successfully!');
}

runExamples()
    .then(() => {
        console.log('✅ All examples ran successfully!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Error running examples:', error);
        process.exit(1);
    });
