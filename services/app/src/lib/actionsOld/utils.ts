import { z } from 'zod';

import type { TFieldErrors, TValidateInputData } from './types';

/**
 * Helper function to validate input data using zod schema. It's possible to pass FormData as input data which will be converted to object before validation.
 * @param inputData Input data to validate.
 * @param schema Zod schema to validate the input data.
 * @returns Object with errors if validation failed or data if validation passed.
 */
export const validateInputData = <
    TInput extends z.ZodTypeAny,
    TOutput extends z.ZodTypeAny = TInput
>(
    inputData: TInput | FormData,
    schema: z.Schema<TOutput, z.ZodTypeDef, TInput>
): TValidateInputData<TInput, TOutput> => {
    let data = inputData;

    // Convert FormData to object which is then passed to zod
    if (inputData instanceof FormData) {
        for (const [key, value] of inputData.entries()) {
            data = {
                ...data,
                [key]: value
            };
        }
    }

    const validatedData = schema.safeParse(inputData);

    if (!validatedData.success) {
        return {
            fieldErrors: validatedData.error.flatten()
                .fieldErrors as TFieldErrors<TInput>
        };
    }

    return {
        validatedData: validatedData.data
    };
};
