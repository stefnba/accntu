import { z } from 'zod';

import { executeAction } from '../execute';
import {
    ActionSchema,
    ActionWithUserAndData,
    ExecuteAction,
    TCreateActionOptions
} from '../types';

export function createFetch<
    TInput extends z.ZodTypeAny,
    TOutput extends z.ZodTypeAny = TInput,
    TReturn = {}
>(
    action: ActionWithUserAndData<TOutput, TReturn>,
    // action: ExecuteAction<TOutput, TReturn>,
    schema?: ActionSchema<TOutput, TInput>,
    options: TCreateActionOptions = { auth: 'protected' }
): (params: TInput) => Promise<TReturn> {
    return async (params?: TInput): Promise<TReturn> => {
        return executeAction(action, schema, params, options);
    };
}

const Schema = z.object({
    test: z.string()
});

const aaa = createFetch(async ({ data }) => {
    return {
        1: 444
    };
}, Schema);
