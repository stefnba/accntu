import { z } from 'zod';

import { ValidationError } from '../errors';
import { executeAction } from '../execute';
import type {
    Action,
    ActionEmpty,
    ActionWithInputData,
    ActionWithUser,
    ActionWithUserAndInputData,
    TActionResult,
    TCreateActionOptions
} from '../types';
import type { TCreateFetchReturn } from './types';

export function createQueryFetch<
    TDataInput,
    TDataOutput = TDataInput,
    TResult extends TActionResult = void
>(
    action: ActionEmpty<TResult>,
    schema: void | undefined,
    options: { auth: 'public' }
): () => Promise<TResult>;
export function createQueryFetch<
    TDataInput,
    TDataOutput = TDataInput,
    TResult extends TActionResult = void
>(
    action: ActionWithUser<TResult>,
    schema: void | undefined,
    options: { auth: 'protected' }
): () => Promise<TResult>;
export function createQueryFetch<
    TDataInput,
    TDataOutput = TDataInput,
    TResult = void
>(action: ActionWithUser<TResult>): () => Promise<TResult>;
export function createQueryFetch<
    TDataInput,
    TDataOutput = TDataInput,
    TResult extends TActionResult = void
>(
    action: ActionWithInputData<TDataOutput, TResult>,
    schema: z.Schema<TDataOutput, z.ZodTypeDef, TDataInput>,
    options: { auth: 'public' }
): (params: TDataInput) => Promise<TResult>;
export function createQueryFetch<
    TDataInput,
    TDataOutput = TDataInput,
    TResult extends TActionResult = void
>(
    action: ActionWithUserAndInputData<TDataOutput, TResult>,
    schema: z.Schema<TDataOutput, z.ZodTypeDef, TDataInput>,
    options?: { auth: 'protected' }
): (params: TDataInput) => Promise<TResult>;
export function createQueryFetch<
    TDataInput,
    TDataOutput = TDataInput,
    TResult extends TActionResult = void
>(
    action: Action<TDataOutput, TResult>,
    schema?: z.Schema<TDataOutput, z.ZodTypeDef, TDataInput> | void,
    options: TCreateActionOptions = { auth: 'protected' }
): (params?: TDataInput) => Promise<TResult> {
    return async (data?: TDataInput): Promise<TResult> => {
        return await executeAction(action, data, schema, options);
    };
}

/**
 * Create fetch function for given action.
 * @param action - Action to create fetch wrapper for.
 * @param schema - Optional schema to validate input data.
 * @param options - Options for action.
 * @returns Fetch function.
 */
export function createFetch<
    TDataInput,
    TDataOutput,
    TResult extends TActionResult = void
>(
    action: ActionEmpty<TResult>,
    schema: void | undefined,
    options: { auth: 'public' }
): () => Promise<TCreateFetchReturn<TDataInput, TResult>>;
export function createFetch<
    TDataInput,
    TDataOutput,
    TResult extends TActionResult = void
>(
    action: ActionWithUser<TResult>,
    schema: void | undefined,
    options: { auth: 'protected' }
): () => Promise<TCreateFetchReturn<TDataInput, TResult>>;
export function createFetch<
    TDataInput,
    TDataOutput,
    TResult extends TActionResult = void
>(
    action: ActionWithUser<TResult>
): () => Promise<TCreateFetchReturn<TDataInput, TResult>>;
export function createFetch<
    TDataInput,
    TDataOutput,
    TResult extends TActionResult = void
>(
    action: ActionWithInputData<TDataOutput, TResult>,
    schema: z.Schema<TDataOutput, z.ZodTypeDef, TDataInput>,
    options: { auth: 'public' }
): (params: TDataInput) => Promise<TCreateFetchReturn<TDataInput, TResult>>;
export function createFetch<
    TDataInput,
    TDataOutput,
    TResult extends TActionResult = void
>(
    action: ActionWithUserAndInputData<TDataOutput, TResult>,
    schema: z.Schema<TDataOutput, z.ZodTypeDef, TDataInput>,
    options?: { auth: 'protected' }
): (params: TDataInput) => Promise<TCreateFetchReturn<TDataInput, TResult>>;
export function createFetch<
    TDataInput,
    TDataOutput,
    TResult extends TActionResult = void
>(
    action: Action<TDataOutput, TResult>,
    schema?: z.Schema<TDataOutput, z.ZodTypeDef, TDataInput> | void,
    options: TCreateActionOptions = { auth: 'protected' }
): (params?: TDataInput) => Promise<TCreateFetchReturn<TDataInput, TResult>> {
    return async (
        params?: TDataInput
    ): Promise<TCreateFetchReturn<TDataInput, TResult>> => {
        try {
            const result = await executeAction(action, params, schema, options);
            return {
                status: 'SUCCESS',
                error: undefined,
                data: result,
                isError: false,
                isSuccess: true
            };
        } catch (error: any) {
            if (error instanceof ValidationError) {
                return {
                    status: 'VALIDATION_ERROR',
                    data: undefined,
                    error: error.fieldErrors,
                    isError: true,
                    isSuccess: false
                };
            }
            return {
                status: 'ERROR',
                data: undefined,
                error: error.message,
                isError: true,
                isSuccess: false
            };
        }
    };
}