import { ValidationError } from '@/server/lib/actions/errors';
import { useCallback, useState } from 'react';

import { IUseMutationOptions, TActionStatus, TUseMutationError } from './types';

export const useFetch = <TDataInput, TActionReturnData>(
    action: (params: TDataInput) => Promise<TActionReturnData>,
    options: IUseMutationOptions<TDataInput, TActionReturnData> = {}
) => {
    const [error, setError] = useState<
        TUseMutationError<TDataInput> | undefined
    >(undefined);
    const [data, setData] = useState<TActionReturnData | undefined>(undefined);
    const [status, setStatus] = useState<TActionStatus>('IDLE');
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const execute = useCallback(
        async (input: TDataInput) => {
            setIsLoading(true);
            setStatus('LOADING');

            // before action is triggered
            if (options.onExecution) {
                input = options.onExecution(input);
            }

            action(input)
                .then((result) => {
                    setData(result);
                    setStatus('SUCCESS');
                })
                .catch((err) => {
                    setStatus('ERROR');

                    if (err instanceof ValidationError) {
                        const error: TUseMutationError<TDataInput> = {
                            fields: err.fieldErrors,
                            type: 'VALIDATION_ERROR'
                        };
                        setError(error);
                        setStatus('VALIDATION_ERROR');
                        options.onError?.(error);

                        return;
                    } else {
                        const error: TUseMutationError<TDataInput> = {
                            error: err.message,
                            type: 'SERVER'
                        };
                        setError(error);
                        setStatus('ERROR');
                        options.onError?.(error);
                    }
                })
                .finally(() => {
                    setIsLoading(false);
                    options.onComplete?.();
                });
        },
        [action, options]
    );

    return {
        execute,
        error,
        data,
        isLoading,
        status
    };
};
