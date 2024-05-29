import { z } from 'zod';

import { getUser } from '../../../lib/auth';
import { ValidationError } from './errors';
import type { Action, TActionResult, TCreateActionOptions } from './types';
import {
    isActionEmpty,
    isActionWithInputData,
    isActionWithUser
} from './utils';
import { validateDataInput } from './validate';

export const executeAction = async <
    TDataInput,
    TDataOutput = TDataInput,
    TResult extends TActionResult = void
>(
    action: Action<TDataOutput, TResult>,
    data?: TDataInput,
    schema?: z.Schema<TDataOutput, z.ZodTypeDef, TDataInput> | void,
    options: TCreateActionOptions = { auth: 'protected' }
) => {
    try {
        const { auth } = options;
        let validatedData: TDataOutput | undefined;

        if (data && schema) {
            const validation = validateDataInput(data, schema);

            // If validation succeeded, assign validated data
            if (validation.validatedData) {
                validatedData = validation.validatedData;
            }

            // If validation failed, throw ValidationError
            if (validation.fieldErrors) {
                throw new ValidationError(validation.fieldErrors);
            }
        }

        if (auth === 'protected') {
            const user = await getUser();

            if (isActionWithUser(action, validatedData, user)) {
                return await action({ user });
            } else if (validatedData) {
                return await action({ data: validatedData, user });
            } else {
                throw Error('Invalid action');
            }
        }

        // public action with input data
        if (
            validatedData &&
            isActionWithInputData(action, validatedData, undefined)
        ) {
            return await action({ data: validatedData });
        } // public action without input data
        else if (
            !validatedData &&
            isActionEmpty(action, validatedData, undefined)
        ) {
            return await action();
        } else {
            throw Error('Invalid action');
        }
    } catch (error: any) {
        console.error('nbaugh', error.message);
        throw error;
    }
};
