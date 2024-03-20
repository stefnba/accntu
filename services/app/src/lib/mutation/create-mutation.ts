import { z } from 'zod';

export type FieldErrors<TInput> = {
    [K in keyof TInput]?: string[];
};

export type ActionState<TInput, TOutput> = {
    fieldErrors?: FieldErrors<TInput>;
    error?: string | null;
    data?: TOutput;
};

/**
 * Wrapper for mutations that handles parsing of input with zod and executes
 * action with validated data.
 * @param action Action to execute.
 * @param schema Validation schema.
 * @returns
 */
const createMutation = <TInput, TOutput>(
    action: (validatedData: TInput) => Promise<TOutput>,
    schema: z.Schema<TInput>
) => {
    return async (inputData: TInput): Promise<ActionState<TInput, TOutput>> => {
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

        const validationResult = schema.safeParse(data);
        if (!validationResult.success) {
            return {
                fieldErrors: validationResult.error.flatten()
                    .fieldErrors as FieldErrors<TInput>
            };
        }

        return {
            data: await action(validationResult.data)
        };
    };
};

export default createMutation;
