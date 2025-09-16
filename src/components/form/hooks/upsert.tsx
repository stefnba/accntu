import { type UseZodFormOptions, useForm } from '@/components/form/hooks';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { FieldValues } from 'react-hook-form';
import { z } from 'zod';

type UpsertMode = 'create' | 'update';

/**
 * Create a form that can be used to upsert a resource with controlled/uncontrolled mode management.
 *
 * Components returned have full access to form instance properties:
 * - form.Form.getValues() ✅
 * - form.Input.mode ✅
 * - form.SubmitButton.switchToCreate() ✅
 */
export const useUpsertForm = <
    TCreateSchema extends z.ZodType<FieldValues, FieldValues> = z.ZodType<FieldValues, FieldValues>,
    TUpdateSchema extends z.ZodType<FieldValues, FieldValues> = z.ZodType<FieldValues, FieldValues>,
    TMode extends UpsertMode = UpsertMode,
>(params: {
    create: {
        schema: TCreateSchema;
    } & UseZodFormOptions<z.input<TCreateSchema>, z.output<TCreateSchema>>;
    update: {
        schema: TUpdateSchema;
    } & UseZodFormOptions<z.input<TUpdateSchema>, z.output<TUpdateSchema>>;
    mode?: TMode;
    onModeChange?: (mode: UpsertMode) => void;
    defaultMode?: UpsertMode;
}) => {
    const { create, update, mode, onModeChange, defaultMode = 'create' } = params;

    const isControlled = mode !== undefined;
    const [internalMode, setInternalMode] = useState<UpsertMode>(defaultMode);
    const currentMode = isControlled ? mode : internalMode;

    const { form: createForm, ...createFormComponents } = useForm(create);
    const { form: updateForm, ...updateFormComponents } = useForm(update);
    const activeForm = currentMode === 'create' ? createForm : updateForm;

    /**
     * Switch to create mode.
     */
    const switchToCreate = useCallback(() => {
        if (isControlled) {
            onModeChange?.('create');
        } else {
            setInternalMode('create');
        }
    }, [isControlled, onModeChange]);

    /**
     * Switch to update mode.
     */
    const switchToUpdate = useCallback(() => {
        if (isControlled) {
            onModeChange?.('update');
        } else {
            setInternalMode('update');
        }
    }, [isControlled, onModeChange]);

    /**
     * Toggle the mode between create and update.
     */
    const toggleMode = useCallback(() => {
        if (currentMode === 'create') {
            switchToUpdate();
        } else {
            switchToCreate();
        }
    }, [currentMode, switchToCreate, switchToUpdate]);

    /**
     * Trigger the active form.
     */
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            activeForm.trigger();
        }, 0);
        return () => clearTimeout(timeoutId);
    }, [currentMode, activeForm]);

    // Add mode management to the active form
    const enhancedForm = useMemo(() => {
        return {
            form: activeForm,
            mode: currentMode,
            isCreate: currentMode === 'create',
            isUpdate: currentMode === 'update',
            toggleMode,
            switchToCreate,
            switchToUpdate,
            ...(currentMode === 'create' ? createFormComponents : updateFormComponents),
        };
    }, [activeForm, currentMode, switchToCreate, switchToUpdate]);

    return enhancedForm;
};
