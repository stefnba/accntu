import {
    testFetch,
    testFetchFail,
    testFetchParams,
    testMutation
} from '@/actions/test/actions';

import { Buttons } from './_components/Buttons';

export default async function Home() {
    // const { data, status, error, isError, isSuccess } = await testFetch();

    await testMutation({ name: 'asdfklasdflk' });

    const { error, isError, status, data } = await testFetchParams({
        name: 'd'
    });

    if (status === 'VALIDATION_ERROR') {
        console.log('Validation error:', error.name);
    }

    return (
        <div>
            <h1>Test page</h1>
            <Buttons />

            <div>{JSON.stringify(data)}</div>
        </div>
    );
}
