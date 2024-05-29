import { z } from 'zod';

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

export function createMutation<
    TDataInput,
    TDataOutput,
    TResult extends TActionResult = void
>(
    action: ActionEmpty<TResult>,
    schema: void | undefined,
    options: { auth: 'public' }
): () => Promise<TResult>;
export function createMutation<
    TDataInput,
    TDataOutput,
    TResult extends TActionResult = void
>(
    action: ActionWithUser<TResult>,
    schema: void | undefined,
    options: { auth: 'protected' }
): () => Promise<TResult>;
export function createMutation<
    TDataInput,
    TDataOutput,
    TResult extends TActionResult = void
>(action: ActionWithUser<TResult>): () => Promise<TResult>;
export function createMutation<
    TDataInput,
    TDataOutput,
    TResult extends TActionResult = void
>(
    action: ActionWithInputData<TDataOutput, TResult>,
    schema: z.Schema<TDataOutput, z.ZodTypeDef, TDataInput>,
    options: { auth: 'public' }
): (params: TDataInput) => Promise<TResult>;
export function createMutation<
    TDataInput,
    TDataOutput,
    TResult extends TActionResult = void
>(
    action: ActionWithUserAndInputData<TDataOutput, TResult>,
    schema: z.Schema<TDataOutput, z.ZodTypeDef, TDataInput>,
    options?: { auth: 'protected' }
): (params: TDataInput) => Promise<TResult>;
export function createMutation<
    TDataInput,
    TDataOutput,
    TResult extends TActionResult = void
>(
    action: Action<TDataOutput, TResult>,
    schema?: z.Schema<TDataOutput, z.ZodTypeDef, TDataInput> | void,
    options: TCreateActionOptions = { auth: 'protected' }
): (params?: TDataInput) => Promise<TResult> {
    return async (params?: TDataInput): Promise<TResult> => {
        const result = await executeAction(action, params, schema, options);
        return result;
    };
}
