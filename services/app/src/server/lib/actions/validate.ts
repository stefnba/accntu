import { z } from 'zod';

import { TFieldErrors } from './types';

export const validateDataInput = <TDataInput, TDataOutput = TDataInput>(
    inputData: TDataInput,
    schema: z.Schema<TDataOutput, z.ZodTypeDef, TDataInput>
) => {
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
                .fieldErrors as TFieldErrors<TDataInput>
        };
    }

    return {
        validatedData: validatedData.data
    };
};
