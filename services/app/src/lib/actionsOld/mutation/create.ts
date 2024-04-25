import { getUser } from '@/auth';
import { z } from 'zod';

import type { TActionReturnObject } from '../types';
import { validateInputData } from '../utils';
import { executeAction } from './execute';
import type {
    CreateMutationReturn,
    TActionWithUser,
    TActionWithoutUser,
    TCreateMutationOptions
} from './types';

/**
 * Wrapper function to create a mutation. It validates input data, executes the mutation and returns the result.
 * @param action
 * @param schema
 * @param options
 * @returns Function which takes data as input and returns a promise with TActionReturnObject.
 * So ultimately, if the action is successful, it will return an object with status 'SUCCESS' and data as the result of the action.
 * If the action fails, it will return an object with status 'ERROR' and error as the error message.
 * If the input data validation fails, it will return an object with status 'VALIDATION_ERROR' and error as the error message.
 */
export function createMutation<TDataInput, TDataOutput, TReturn>(
    action: TActionWithUser<TDataOutput, TReturn>,
    schema: z.Schema<TDataOutput, z.ZodTypeDef, TDataInput>,
    options?: { auth: 'protected' }
): CreateMutationReturn<TDataInput, TReturn>;
export function createMutation<TDataInput, TDataOutput, TReturn>(
    action: TActionWithoutUser<TDataOutput, TReturn>,
    schema: z.Schema<TDataOutput, z.ZodTypeDef, TDataInput>,
    options: { auth: 'public' }
): CreateMutationReturn<TDataInput, TReturn>;
export function createMutation<
    TDataInput extends z.ZodTypeAny,
    TDataOutput extends z.ZodTypeAny = TDataInput,
    TReturn = {}
>(
    action:
        | TActionWithUser<TDataOutput, TReturn>
        | TActionWithoutUser<TDataOutput, TReturn>,
    schema: z.Schema<TDataOutput, z.ZodTypeDef, TDataInput>,
    options: TCreateMutationOptions = { auth: 'protected' }
): CreateMutationReturn<TDataInput, TReturn> {
    return async (
        data: TDataInput
    ): Promise<TActionReturnObject<TDataInput, TReturn>> => {
        // validate input data
        const validation = validateInputData(data, schema);

        // execute public mutations, e.g. login, without user object
        if (options?.auth === 'public') {
            return executeAction(action, validation);
        }

        // add user object for private mutations
        const user = await getUser();
        return executeAction(action, validation, user);
    };
}
