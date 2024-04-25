import { User } from 'lucia';

import type { TActionReturnObject, TValidateInputData } from '../types';
import type { TActionWithUser, TActionWithoutUser } from './types';

/**
 * Always resolves action. Hence, it should not be used for React Query.
 * @param action
 * @param validatedData
 * @returns Object with status and either data (which is data returned by the action) or error (message of the error).
 */
export const executeAction = async <TDataInput, TDataOutput, TReturn>(
    action:
        | TActionWithUser<TDataOutput, TReturn>
        | TActionWithoutUser<TDataOutput, TReturn>,
    schemaValidation: TValidateInputData<TDataInput, TDataOutput>,
    user?: User
): Promise<TActionReturnObject<TDataInput, TReturn>> => {
    // return errors if validation failed
    if ('fieldErrors' in schemaValidation) {
        console.error('Validation error:', schemaValidation.fieldErrors);
        return {
            status: 'VALIDATION_ERROR',
            error: schemaValidation.fieldErrors
        };
    }

    const validatedData = schemaValidation.validatedData;

    try {
        const result = await action({
            data: validatedData,
            user
        });
        return {
            status: 'SUCCESS',
            data: result
        };
    } catch (error: any) {
        console.error('Error while execution Action:', error.message);
        return {
            status: 'ERROR',
            error: error.message
        };
    }
};
