import { errorFactory } from '@/server/lib/error';

/*
 * Validate if the result exists. If not, throw an error.
 * @param result - The result to validate
 * @param errorMessage - The error message to throw if the result does not exist
 * @returns The result
 */
export const validateExists = <T extends object>(
    result: T | null,
    errorMessage: string = 'Resource not found'
): T => {
    // check if result is null or undefined
    if (!result) {
        // throw service error,
        // central error handler will handle this
        throw errorFactory.createError({
            layer: 'SERVICE',
            code: 'NOT_FOUND',
            type: 'RESOURCE',
            message: errorMessage,
        });
    }
    return result;
};
