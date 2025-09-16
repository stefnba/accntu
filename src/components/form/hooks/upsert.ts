import { type UseZodFormOptions, UseZodFormReturn, useForm } from '@/components/form/hooks';
import { FieldValues } from 'react-hook-form';
import { z } from 'zod';

/**
 * Create a form that can be used to upsert a resource.
 *
 * @param params - The parameters for the form
 * @returns The form
 *
 * @example
 * ```tsx
 * const form = useUpsertForm({
 *   create: {
 *     schema: z.object({ name: z.string() }),
 *   },
 *   update: {
 *     schema: z.object({ name: z.string() }),
 *   },
 *   isUpdate: false,
 * });
 * ```
 */
export const useUpsertForm = <
    TCreateSchema extends z.ZodType<FieldValues, FieldValues> = z.ZodType<FieldValues, FieldValues>,
    TUpdateSchema extends z.ZodType<FieldValues, FieldValues> = z.ZodType<FieldValues, FieldValues>,
    TMode extends boolean = boolean,
>(params: {
    create: {
        schema: TCreateSchema;
    } & UseZodFormOptions<z.input<TCreateSchema>, z.output<TCreateSchema>>;
    update: {
        schema: TUpdateSchema;
    } & UseZodFormOptions<z.input<TUpdateSchema>, z.output<TUpdateSchema>>;
    isCreate: TMode;
}): UseZodFormReturn<
    z.input<TCreateSchema & TUpdateSchema>,
    any,
    z.output<TCreateSchema & TUpdateSchema>
> => {
    const { create, update, isCreate } = params;
    if (!isCreate) {
        return useForm(update);
    } else {
        return useForm(create);
    }
};
