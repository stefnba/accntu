import { ValidationError } from '@/server/lib/actions/errors';
import type { Action } from '@/server/lib/actions/types';
import { useCallback, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';

import { IUseMutationOptions, TActionStatus, TUseMutationError } from './types';

export const useMutation = <
    TDataInput extends Record<string, any>,
    TActionReturnData
>(
    action: (input: TDataInput) => Promise<TActionReturnData>,
    options: IUseMutationOptions<TDataInput, TActionReturnData> = {},
    form?: UseFormReturn<any>
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

            let formData = input;

            // before action is triggered
            if (options.onExecution) {
                input = options.onExecution(input);
            }

            // convert input to FormData if useFormData is set to true
            // Required for e.g. file uploads
            if (options.useFormData) {
                const formD = new FormData();
                Object.entries(input).map(([key, value]) => {
                    formD.append(key, value);
                });

                formData = formD as unknown as TDataInput;
            }

            action(formData)
                .then((result) => {
                    setData(result);
                    setStatus('SUCCESS');

                    if (options.onSuccess) {
                        options.onSuccess?.(result);
                    }

                    // reset form
                    if (options.resetOnSuccess) {
                        if (form) {
                            form.reset();
                        } else {
                            throw new Error(
                                '`form` arg must be provided to reset form.'
                            );
                        }
                    }
                })
                .catch((err: Error) => {
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
        [action, options, form]
    );

    return {
        execute,
        error,
        data,
        isLoading,
        status
    };
};
