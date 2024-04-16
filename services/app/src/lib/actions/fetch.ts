import { getUser } from '@/lib/auth';
import { User } from 'lucia';
import { z } from 'zod';

type TAction<TData, TReturnData extends Record<string, any>> = (
    data: TData,
    user: User
) => Promise<TReturn<TReturnData>>;

export type TReturn<R extends Record<string, any>> =
    | { error?: undefined; success: R }
    | { error: string; success?: undefined };

export function createAction<TData, TReturnData extends Record<string, any>>(
    action: TAction<TData, TReturnData>
) {
    return async (data: TData): Promise<TReturn<TReturnData>> => {
        const user = await getUser();

        const result = await action(data, user);

        if (result.error) {
            // todo log errors
            console.error('error in fetch', result.error);

            return { error: result.error };
        }

        return result;
    };
}

/**
 * Server action
 */
type TFetchActionWithParams<
    TParams,
    TReturnData extends Record<string, any>
> = (user: User, params: TParams) => Promise<TReturnData>;

/**
 * Server action.
 */
type TFetchActionWithoutParams<TReturnData extends Record<string, any>> = (
    user: User
) => Promise<TReturnData>;

/**
 * Return type for createFetch wrapper.
 */
export type TFetchReturn<TReturnData extends Record<string, any>> =
    | { error?: undefined; success: TReturnData }
    | { error: string; success?: undefined };

/**
 * Wrapper for fetch server actions.
 * @param action fetch function.
 * @param params optional params that are provided to fetch function.
 * @returns data returned by the fetch function.
 */
export function createFetch<
    TParamsInput,
    TReturnData extends Record<string, any>,
    TParamsOutput = any
>(
    action: TFetchActionWithParams<TParamsOutput, TReturnData>,
    schema: z.Schema<TParamsOutput, z.ZodTypeDef, TParamsInput>
): (params: TParamsInput) => Promise<TFetchReturn<TReturnData>>;
export function createFetch<
    TParamsInput,
    TReturnData extends Record<string, any>
>(
    action: TFetchActionWithoutParams<TReturnData>
): () => Promise<TFetchReturn<TReturnData>>;
export function createFetch<
    TParamsInput,
    TReturnData extends Record<string, any>,
    TParamsOutput = any
>(
    action:
        | TFetchActionWithParams<TParamsOutput, TReturnData>
        | TFetchActionWithoutParams<TReturnData>,
    schema?: z.Schema<TParamsOutput, z.ZodTypeDef, TParamsInput>
): (
    params: TParamsInput
) =>
    | Promise<TFetchReturn<TReturnData>>
    | (() => Promise<TFetchReturn<TReturnData>>) {
    return async (params: TParamsInput): Promise<TFetchReturn<TReturnData>> => {
        try {
            const user = await getUser();

            if (schema && params) {
                const validatedData = schema.safeParse(params);
                if (!validatedData.success) {
                    // todo logging
                    console.error(
                        'failed validation',
                        validatedData.error.errors
                    );
                    return {
                        error: 'Specified params are not valid.'
                    };
                }

                const result = await action(user, validatedData.data);
                return {
                    success: result
                };
            }

            /* no params provided */
            const result = await action(user, undefined as TParamsOutput);
            return {
                success: result
            };
        } catch (e: any) {
            // todo logging
            console.error(e);

            return {
                error: e.message
            };
        }
    };
}
