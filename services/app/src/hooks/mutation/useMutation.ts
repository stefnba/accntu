import { TActionState, TFieldErrors } from '@/lib/mutation';
import { useCallback, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';

type Action<TInput, TOutput> = (
    data: TInput
) => Promise<TActionState<TInput, TOutput>>;

interface IUseMutationOptions<TInput, TOutput> {
    /* Callback to execute before action is triggered */
    onSubmit?: (data: TInput) => TInput;
    /* Callback to execute on success */
    onSuccess?: (data: TOutput) => void;
    onError?: (error: Error) => void;
    onFieldError?: (error: TFieldErrors<TInput>) => void;
    onComplete?: () => void;
    resetOnSuccess?: boolean;
    useFormData?: boolean;
}

type TActionStatus = 'IDLE' | 'LOADING' | 'ERROR' | 'SUCCESS';

/**
 * Hook to execute a mutation.
 * @param action
 * @param options
 * @param form pass `useForm()` hook from `react-hook-form` to display server-side fieldErrors below fields and reset form onComplete
 * @returns
 */
const useMutation = <TInput extends Record<string, any>, TOutput>(
    action: Action<TInput, TOutput>,
    options: IUseMutationOptions<TInput, TOutput> = {},
    form?: UseFormReturn<any>
) => {
    const [error, setError] = useState<string | undefined>(undefined);
    const [data, setData] = useState<TOutput | undefined>(undefined);
    const [status, setStatus] = useState<TActionStatus>('IDLE');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [fieldErrors, setFieldErrors] = useState<
        TFieldErrors<TInput> | undefined
    >(undefined);

    const execute = useCallback(
        async (input: TInput) => {
            setIsLoading(true);
            setStatus('LOADING');

            let formData = input;

            // before action is triggered
            if (options.onSubmit) {
                input = options.onSubmit(input);
            }

            // convert input to FormData if useFormData is set to true
            // Required for e.g. file uploads
            if (options.useFormData) {
                const formD = new FormData();
                Object.entries(input).map(([key, value]) => {
                    formD.append(key, value);
                });

                formData = formD as unknown as TInput;
            }

            action(formData)
                .then((result) => {
                    if (!result) {
                        return;
                    }

                    // return data
                    if (result.data) {
                        setData(result.data);
                        setStatus('SUCCESS');
                        options.onSuccess?.(result.data);

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
                    }

                    // validation error
                    if (result.fieldErrors) {
                        setFieldErrors(result.fieldErrors);
                        options.onFieldError?.(result.fieldErrors);

                        // display field errors below form fields similiar to client-side validation
                        if (form) {
                            Object.entries(result.fieldErrors).map((err) => {
                                const [name, message] = err as [
                                    string,
                                    string[]
                                ];

                                form.setError(name, {
                                    message: message[0],
                                    type: 'server'
                                });
                            });
                        }
                    }
                })
                .catch((err: Error) => {
                    // server error
                    setError(err.message);
                    setStatus('ERROR');
                    options.onError?.(err);
                })
                .finally(() => {
                    setIsLoading(false);
                    // setStatus('IDLE');
                    options.onComplete?.();
                });
        },
        [action, options, form]
    );

    return {
        execute,
        fieldErrors,
        error,
        data,
        isLoading,
        status
    };
};

export default useMutation;
