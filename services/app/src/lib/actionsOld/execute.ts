import { User } from 'lucia';
import { z } from 'zod';

import { getUser } from '../auth';
import { ValidationError } from './error';
import { ActionSchema, ExecuteAction, TCreateActionOptions } from './types';
import { validateInputData } from './utils';

/**
 * Execute a fetch or mutation action.
 * @param action
 * @param schema
 * @param data
 * @returns
 */
export const executeAction = async <
    TDataInput extends z.ZodTypeAny,
    TDataOutput extends z.ZodTypeAny = TDataInput,
    TReturn = {}
>(
    action: ExecuteAction<TDataOutput, TReturn>,
    schema?: ActionSchema<TDataOutput, TDataInput>,
    data?: TDataInput,
    options: TCreateActionOptions = { auth: 'protected' }
): Promise<TReturn> => {
    try {
        let user: User | undefined;

        if (options.auth === 'protected') {
            user = await getUser();
        }

        if (schema && data) {
            const validation = validateInputData(data, schema);
            if ('fieldErrors' in validation) {
                throw new ValidationError(validation.fieldErrors);
            }

            if (user) {
                return await action({ data: validation.validatedData, user });
            }
            return await action({ data: validation.validatedData });
        }

        if (user) {
            return await action({ user });
        }
        return await action();
    } catch (error: any) {
        throw new Error(error.message);
    }
};
