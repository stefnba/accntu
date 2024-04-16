'use client';

import { useCallback, useState } from 'react';

import type { TActionStatus, TFetchError } from './types';

/**
 * Hook to execute a fetch server action.
 * @param action Can be either a function that accepts parameters or w/o.
 */
export const useFetch = <
    TInput extends Record<string, any> | void,
    TOutput extends Record<string, any>
>(
    action: (params: TInput) => Promise<TOutput>
) => {
    const [data, setData] = useState<TOutput | undefined>(undefined);
    const [error, setError] = useState<TFetchError | undefined>(undefined);
    const [status, setStatus] = useState<TActionStatus>('IDLE');
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const execute = useCallback(
        async (input: TInput) => {
            setIsLoading(true);
            setStatus('LOADING');

            action(input)
                .then((data) => {
                    /* Action successful */
                    if (data.success) {
                        setStatus('SUCCESS');
                        setData(data.success);
                    }

                    /* Error returned by action */
                    if (data.error) {
                        setStatus('ERROR');
                        setError({
                            message: data.error,
                            type: 'ACTION'
                        });
                    }
                })
                .catch((error) => {
                    setStatus('ERROR');
                    setError({
                        message: error.message,
                        type: 'SERVER'
                    });
                })
                .finally(() => {
                    setIsLoading(false);
                });
        },
        [action]
    );

    return {
        execute,
        data,
        error,
        status,
        isLoading
    };
};
