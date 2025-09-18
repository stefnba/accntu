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

    /**
     * Dynamic initial data that may not be available on first render.
     * When this data changes from undefined to defined, the form will automatically reset with the new values.
     * Useful for edit forms where data comes from API calls.
     */
    initialData?: Partial<TFieldValues> | null | undefined;

    /**
     * Whether to show loading state while waiting for initial data.
     * When true, form components will be disabled until initialData is available.
     * Defaults to true when initialData is provided but undefined/null.
     */
    showLoadingState?: boolean;

    /**
     * Whether to require changes before allowing form submission.
     * When true, form will be invalid until user modifies the initial data.
     * Useful for edit forms to prevent unnecessary API calls when nothing changed.
     * Defaults to false.
     */
    requireChanges?: boolean;
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
     * Whether the form is currently loading initial data.
     * True when waiting for async initialData to arrive.
     */
    isLoading: boolean;

    /**
     * Whether the form has changes compared to initial data.
     * Only relevant when requireChanges is enabled.
     */
    hasChanges?: boolean;

    /**
     * Server error from business logic (e.g., "Password incorrect").
     * Separate from form validation errors.
     */
    serverError: string | null;

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
    /**
     * Current mode of the form. When provided, makes the hook controlled.
     */
    mode?: TMode;
    /**
     * Callback fired when mode changes (for controlled usage)
     */
    onModeChange?: (mode: TFormMode) => void;
    /**
     * Default mode when hook is uncontrolled
     */
    defaultMode?: TFormMode;
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
