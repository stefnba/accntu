import {
    FieldPath,
    FieldValues,
    SubmitErrorHandler,
    SubmitHandler,
    UseFormProps,
    UseFormReturn,
} from 'react-hook-form';

import { z } from 'zod/v4';

/**
 * Enhanced form hook options that extend React Hook Form's options
 */
export interface UseZodFormOptions<
    TFieldValues extends FieldValues,
    TTransformedValues = TFieldValues,
> extends Omit<UseFormProps<TFieldValues, any, TTransformedValues>, 'resolver'> {
    /**
     * Optional onSubmit handler for successful form submission
     */
    onSubmit?: SubmitHandler<TTransformedValues>;

    /**
     * Optional onError handler for form submission errors
     */
    onError?: SubmitErrorHandler<TFieldValues>;
}

/**
 * Enhanced form hook return type that extends React Hook Form's return type
 */
export interface UseZodFormReturn<
    TFormValues extends FieldValues,
    Context = any,
    TTransformedValues = TFormValues,
> extends Omit<UseFormReturn<TFormValues, Context, TTransformedValues>, 'handleSubmit'> {
    /**
     * Form submission handler that automatically validates the form
     * and calls the provided onSubmit/onError handlers
     */
    handleSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;

    /**
     * Native React Hook Form handleSubmit for backward compatibility
     */
    handleNativeSubmit: UseFormReturn<TFormValues, Context, TTransformedValues>['handleSubmit'];

    /**
     * Whether the form is currently submitting
     */
    isSubmitting: boolean;

    /**
     * Whether the form has been submitted successfully
     */
    // isSubmitSuccessful: boolean;

    /**
     * Form submission error, if any
     */
    // submitError: Error | null;

    /**
     * Reset the form submission state
     */
    // resetSubmitState: () => void;
}

//============================================
// Upsert
//============================================

/**
 * The mode of the form
 */
export type TFormMode = 'create' | 'update';

/**
 * The mode of the component
 */
export type TComponentMode = 'create' | 'update' | 'both';

/**
 * Configuration for the useUpsertForm hook
 * @param TMode - The mode of the form
 * @param TCreateSchema - The create schema
 * @param TUpdateSchema - The update schema
 * @returns The configuration for the useUpsertForm hook
 */
export interface UseUpsertFormConfig<
    TMode extends TFormMode,
    TCreateSchema extends z.ZodType<FieldValues, FieldValues>,
    TUpdateSchema extends z.ZodType<FieldValues, FieldValues>,
> {
    create: {
        schema: TCreateSchema;
    } & UseZodFormOptions<z.input<TCreateSchema>, z.output<TCreateSchema>>;
    update: {
        schema: TUpdateSchema;
    } & UseZodFormOptions<z.input<TUpdateSchema>, z.output<TUpdateSchema>>;
    mode: TMode;
}

/**
 * Type for the field path of the upsert form
 * @param M - The mode of the form
 * @param TCreateSchema - The create schema
 * @param TUpdateSchema - The update schema
 * @returns The field path of the upsert form
 */
export type UpsertFieldPath<
    M extends TComponentMode,
    TCreateSchema extends z.ZodType<FieldValues, FieldValues>,
    TUpdateSchema extends z.ZodType<FieldValues, FieldValues>,
> = M extends 'create'
    ? FieldPath<z.input<TCreateSchema>>
    : M extends 'update'
      ? FieldPath<z.input<TUpdateSchema>>
      : FieldPath<z.input<TCreateSchema>> & FieldPath<z.input<TUpdateSchema>>;
