'use server';

import { createFetch, createMutation } from '@/lib/actions';

import { TestSchema } from './schema';

export const testMutation = createMutation(async ({ user, data }) => {
    console.log('testMutation', data, user.id);

    return {
        hello: 'world'
    };
}, TestSchema);

export const testFetchParams = createFetch(async ({ user, data }) => {
    console.log('testFetchParams', data);

    return {
        hello: 'world',
        ...data
    };
}, TestSchema);
export const testFetch = createFetch(async ({ user }) => {
    console.log('test fetch protected', user);

    return {
        hello: 'world'
    };
});
export const testFetchFail = createFetch(async ({ user }) => {
    throw new Error('This is a test error');

    return {
        hello: 'world'
    };
});

// export const testMutation = createMutation(async ({ data, user }) => {
//     console.log('data:', data);
//     console.log('user:', user);
//     return {
//         hello: 'world'
//     };
// }, TestSchema);

// export const testFailMutation = createMutation(async ({ data, user }) => {
//     throw new Error('This is a test error');
// }, TestSchema);

// testFailMutation({ name: 'dkdkdk' }).then((result) => {
//     if (result.status === 'VALIDATION_ERROR') {
//         console.log('Validation error:', result.error.name);
//     }
// });
