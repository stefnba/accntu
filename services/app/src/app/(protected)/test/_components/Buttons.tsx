'use client';

import { testMutation } from '@/actions/test/actions';
import { Button } from '@/components/ui/button';
import { useMutation } from '@/lib/hooks/actions';

export const Buttons = () => {
    const { data, execute, error, isLoading, status } = useMutation(
        testMutation,
        {
            onSuccess: (data) => {
                console.log('onSuccess:', data);
            }
        }
    );
    const { execute: executeFail } = useMutation(testMutation, {
        onError: (error) => {
            if (error.type === 'VALIDATION_ERROR') {
                console.log('Validation error:', error.fields.name);
            }
            console.log('error onError:', error);
        }
    });

    if (error) {
        console.log('erroraaaa:', error);
    }

    console.log('data:', data, isLoading);

    return (
        <div>
            <Button onClick={() => execute({ name: 'dkdkdk' })}>
                Button 1
            </Button>
            <Button onClick={() => executeFail({ name: [1, 2, 3] })}>
                Validation Fail
            </Button>
            <Button onClick={() => executeFail({ name: 'dkdkdk' })}>
                Faild
            </Button>
        </div>
    );
};
