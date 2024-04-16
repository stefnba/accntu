import { getUser } from '@/auth';
import { User } from 'lucia';
import { z } from 'zod';

export type TFieldErrors<TInput> = {
    [K in keyof TInput]?: string[];
};

export type TActionState<TInput, TOutput> = {
    fieldErrors?: TFieldErrors<TInput>;
    error?: string | null;
    data?: TOutput;
};

type TAction<TInput, TOutput> = (
    validatedData: TInput,
    user: User
) => Promise<TOutput>;

type TActionOptionalUser<TInput, TOutput> = (
    validatedData: TInput,
    user?: User
) => Promise<TOutput>;

type TActionPublic<TInput, TOutput> = (
    validatedData: TInput
) => Promise<TOutput>;

type TMutationReturn<TInput, TOutput> = (
    inputData: TInput
) => Promise<TActionState<TInput, TOutput>>;

const validateInputData = <TInput>(
    inputData: TInput | FormData,
    schema: z.Schema<TInput>
): { fieldErrors: TFieldErrors<TInput> } | { data: TInput } => {
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
        data: validatedData.data
    };
};

async function executeMutation<TInput, TOutput>(
    action: TActionOptionalUser<TInput, TOutput>,
    schema: z.Schema<TInput>,
    inputData: TInput | FormData,
    user?: User
): Promise<TActionState<TInput, TOutput>> {
    const validationResult = validateInputData(inputData, schema);

    if ('fieldErrors' in validationResult) {
        return validationResult.fieldErrors;
    }

    return {
        data: await action(validationResult.data, user)
    };
}

// /**
//  *
//  * @param action
//  * @param schema
//  * @returns
//  */
// export function createMutation11<TInput, TOutput>(
//     action: TAction<TInput, TOutput>,
//     schema: z.Schema<TInput>
// ): TMutationReturn<TInput, TOutput> {
//     return async (inputData: TInput) => {
//         const user = await getUser();
//         return executeMutation(
//             action as TActionOptionalUser<TInput, TOutput>,
//             schema,
//             inputData,
//             user
//         );
//     };
// }

// export function createMutationPublic<TInput, TOutput>(
//     action: TActionPublic<TInput, TOutput>,
//     schema: z.Schema<TInput>
// ): TMutationReturn<TInput, TOutput> {
//     return async (inputData: TInput) => {
//         return executeMutation(action, schema, inputData);
//     };
// }

// export function test<TInput, TOutput>(
//     action: TAction<TInput, TOutput>,
//     schema: z.Schema<TInput>,
//     type?: 'protected'
// ): TMutationReturn<TInput, TOutput>;
// export function test<TInput, TOutput>(
//     action: TActionPublic<TInput, TOutput>,
//     schema: z.Schema<TInput>,
//     type: 'public'
// ): TMutationReturn<TInput, TOutput>;
// export function test<TInput, TOutput>(
//     action: TActionPublic<TInput, TOutput> | TAction<TInput, TOutput>,
//     schema: z.Schema<TInput>,
//     type: 'public' | 'protected' = 'protected'
// ): TMutationReturn<TInput, TOutput> {
//     return async (inputData: TInput) => {
//         if (type === 'protected') {
//             const user = await getUser();
//             return executeMutation(action as any, schema, inputData, user);
//         }

//         return executeMutation(action as any, schema, inputData);
//     };
// }

/**
 * Wrapper for mutations that handles parsing of input with zod and executes
 * action with validated data.
 * @param action Action to execute.
 * @param schema Validation schema.
 * @returns
 */
function createMutationCurrent<TInput, TOutput>(
    action: TAction<TInput, TOutput>,
    schema: z.Schema<TInput>
): TMutationReturn<TInput, TOutput> {
    return async (
        inputData: TInput
    ): Promise<TActionState<TInput, TOutput>> => {
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
                    .fieldErrors as TFieldErrors<TInput>
            };
        }

        const user = await getUser();

        return {
            data: await action(validationResult.data, user)
        };
    };
}

export function createMutation<TInput, TOutput>(
    action: TAction<TInput, TOutput>,
    schema: z.Schema<TInput>,
    options?: { auth: 'protected' }
): TMutationReturn<TInput, TOutput>;
export function createMutation<TInput, TOutput>(
    action: TActionPublic<TInput, TOutput>,
    schema: z.Schema<TInput>,
    options: { auth: 'public' }
): TMutationReturn<TInput, TOutput>;
export function createMutation<TInput, TOutput>(
    action: TAction<TInput, TOutput> | TActionPublic<TInput, TOutput>,
    schema: z.Schema<TInput>,
    options: { auth: 'public' | 'protected' } = { auth: 'protected' }
): TMutationReturn<TInput, TOutput> {
    return async (inputData: TInput) => {
        // execute public mutations, e.g. login
        if (options?.auth === 'public') {
            return executeMutation(action as any, schema, inputData);
        }

        // add user object for private mutations
        const user = await getUser();
        return executeMutation(action as any, schema, inputData, user);
    };
}
