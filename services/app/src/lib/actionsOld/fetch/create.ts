import { getUser } from '@/lib/auth';
import { z } from 'zod';

import { executeAction } from '../execute';
import { ActionSchema, TActionReturnObject, TFieldErrors } from '../types';
import { validateInputData } from '../utils';
import { TFetchAction } from './types';

class ValidationError extends Error {
    constructor(errors: TFieldErrors<any>) {
        super('dafdssadf');
        this.name = 'ValidationError';
    }
}

/**
 * Wrapper for server function that fetches data with ReactQuery.
 * If the action fails, the error will be thrown and ReactQuery will handle it.
 */
export function createQueryFetch<
    TDataInput extends z.ZodTypeAny,
    TDataOutput extends z.ZodTypeAny = TDataInput,
    TReturn = {}
>(
    action: TFetchAction<TDataOutput, TReturn>,
    schema?: ActionSchema<TDataOutput, TDataInput>
) {
    return async (params?: TDataInput): Promise<TReturn> => {
        const result = await executeAction(action, schema, params);

        if (result.status === 'SUCCESS') {
            return result.data;
        }

        if (result.status === 'ERROR') {
            throw new Error(result.error);
        }
        if (result.status === 'VALIDATION_ERROR') {
            throw new ValidationError(result.error);
        }
        throw new Error('There was a an error. Please try again.');
    };
}

export function createFetch<
    TDataInput extends z.ZodTypeAny,
    TDataOutput extends z.ZodTypeAny = TDataInput,
    TReturn = {}
>(
    action: TFetchAction<TDataOutput, TReturn>,
    schema?: ActionSchema<TDataOutput, TDataInput>
) {
    return async (params?: TDataInput) => {
        return executeFetch(action, schema, params);
    };
}

export type CreateActionReturn<TDataInput, TActionReturnData> = (
    params: TDataInput
) => Promise<TActionReturnObject<TDataInput, TActionReturnData>>;

export function createPublicFetch<
    TDataInput extends z.ZodTypeAny,
    TDataOutput extends z.ZodTypeAny = TDataInput,
    TReturn = {}
>(
    action: ({ data }: { data: TDataOutput }) => Promise<TReturn>,
    schema?: ActionSchema<TDataOutput, TDataInput>
): CreateActionReturn<TDataInput, TReturn>;
export function createPublicFetch<
    TDataInput extends z.ZodTypeAny,
    TDataOutput extends z.ZodTypeAny = TDataInput,
    TReturn = {}
>(action: () => Promise<TReturn>): CreateActionReturn<TDataInput, TReturn>;
export function createPublicFetch<
    TDataInput extends z.ZodTypeAny,
    TDataOutput extends z.ZodTypeAny = TDataInput,
    TReturn = {}
>(
    action: ({
        data
    }: {
        data: TDataOutput;
    }) => Promise<TReturn> | (() => Promise<TReturn>),
    schema?: ActionSchema<TDataOutput, TDataInput>
): CreateActionReturn<TDataInput, TReturn> {
    return async (data?: TDataInput) => {
        return executeFetch(action, schema, data);
    };
}
