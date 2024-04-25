import { getUser } from '@/lib/auth';
import { User } from 'lucia';
import { z } from 'zod';

import { ActionSchema, TActionReturnObject } from '../types';
import { validateInputData } from '../utils';
import {
    TExecuteAction,
    TFetchAction,
    TFetchActionWithoutParams
} from './types';

const hasParams = <TParams, TReturn>(
    action: TFetchAction<TParams, TReturn>,
    data?: TParams | undefined
): action is TFetchActionWithoutParams<TReturn> => {
    return data === undefined;
};

export const executeFetch = async <
    TDataInput extends z.ZodTypeAny,
    TDataOutput extends z.ZodTypeAny = TDataInput,
    TReturn = {}
>(
    action: () => Promise<TReturn> &
        (({ data }: { data: TDataOutput }) => Promise<TReturn>),
    schema?: ActionSchema<TDataOutput, TDataInput>,
    data?: TDataInput,
    options: { auth: 'protected' | 'public' } = { auth: 'protected' }
): Promise<TActionReturnObject<TDataInput, TReturn>> => {
    try {
        let result: TReturn;
        let user: User | undefined;

        if (options?.auth === 'protected') {
            user = await getUser();
        }

        action();

        // execute action with params
        if (schema && data) {
            // validate input
            const validation = validateInputData(data, schema);
            if ('fieldErrors' in validation) {
                return {
                    status: 'VALIDATION_ERROR',
                    error: validation.fieldErrors
                };
            }

            if (user) {
                result = await action({
                    user,
                    data: validation.validatedData
                });
            } else {
                result = await action({
                    data: validation.validatedData
                });
            }
        }
        // execute action without params
        else {
            if (user) {
                result = await action({ user });
            } else {
                result = await action({});
            }
        }

        return {
            status: 'SUCCESS',
            data: result
        };
    } catch (error: any) {
        console.error('Error happened during executeFetch:', error);
        return {
            status: 'ERROR',
            error: error.message
        };
    }
};
