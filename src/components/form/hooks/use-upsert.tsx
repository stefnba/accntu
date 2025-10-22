import { FormCheckbox } from '@/components/form/checkbox';
import { FormColorSelect } from '@/components/form/color-select';
import { useForm } from '@/components/form/hooks';
import { FormInput } from '@/components/form/input';
import { FormRadioGroup } from '@/components/form/radio-group';
import { FormSelect } from '@/components/form/select';
import { FormSwitch } from '@/components/form/switch';
import { FormTextarea } from '@/components/form/textarea';
import React, { useCallback, useMemo, useState } from 'react';
import { FieldValues } from 'react-hook-form';
import { z } from 'zod/v4';
import type { TComponentMode, TFormMode, UpsertFieldPath, UseUpsertFormConfig } from './types';

/**
 * Render component if display mode is both or the same as the form mode
 */
const withRenderOrNot = <TComponent extends React.ReactNode>(args: {
    mode?: TComponentMode;
    formMode: TFormMode;
    component: TComponent;
}): TComponent | null => {
    const { mode = 'both', formMode, component } = args;

    if (mode === 'both' || mode === formMode) {
        return component;
    }
    return null;
};

/**
 * Main hook: useUpsertForm
 * - Accepts create & update schemas
 * - Supports both controlled and uncontrolled mode management
 * - Returns form instance, mode switching functions, and form components
 */
export const useUpsertForm = <
    TCreateSchema extends z.ZodType<FieldValues, FieldValues>,
    TUpdateSchema extends z.ZodType<FieldValues, FieldValues>,
    TMode extends TFormMode = 'create',
>(
    config: UseUpsertFormConfig<TMode, TCreateSchema, TUpdateSchema>
) => {
    const { create, update, mode, onModeChange, defaultMode = 'create' } = config;

    //============================================
    // Mode management (controlled/uncontrolled)
    //============================================

    const isControlled = useMemo(() => mode !== undefined, [mode]);
    const [internalMode, setInternalMode] = useState<TFormMode>(defaultMode);
    const currentMode = isControlled ? mode! : internalMode;

    //============================================
    // Form instances
    //============================================

    const createForm = useForm(create);
    const updateForm = useForm(update);
    const selectedForm = currentMode === 'update' ? updateForm.form : createForm.form;

    //============================================
    // Mode switching functions
    //============================================

    const switchToCreate = useCallback(() => {
        if (isControlled) {
            onModeChange?.('create');
        } else {
            setInternalMode('create');
        }
    }, [isControlled, onModeChange]);

    const switchToUpdate = useCallback(() => {
        if (isControlled) {
            onModeChange?.('update');
        } else {
            setInternalMode('update');
        }
    }, [isControlled, onModeChange]);

    const toggleMode = useCallback(() => {
        if (currentMode === 'create') {
            switchToUpdate();
        } else {
            switchToCreate();
        }
    }, [currentMode, switchToCreate, switchToUpdate]);

    //============================================
    // Components with form binding
    //============================================

    const InputComponent = useCallback(
        <M extends TComponentMode = 'both'>({
            mode,
            ...props
        }: Omit<React.ComponentProps<typeof FormInput>, 'form' | 'name'> & {
            mode?: M;
            name: UpsertFieldPath<M, TCreateSchema, TUpdateSchema>;
        }) =>
            withRenderOrNot({
                mode,
                formMode: currentMode,
                component: <FormInput form={selectedForm as any} {...props} />,
            }),
        [] // Remove dependencies to keep component definition stable
    );

    const TextareaComponent = useCallback(
        <M extends TComponentMode = 'both'>({
            mode,
            ...props
        }: Omit<React.ComponentProps<typeof FormTextarea>, 'form' | 'name'> & {
            mode?: M;
            name: UpsertFieldPath<M, TCreateSchema, TUpdateSchema>;
        }) =>
            withRenderOrNot({
                mode,
                formMode: currentMode,
                component: <FormTextarea form={selectedForm as any} {...props} />,
            }),
        [] // Remove dependencies to keep component definition stable
    );

    const SelectComponent = useCallback(
        <M extends TComponentMode = 'both'>({
            mode,
            ...props
        }: Omit<React.ComponentProps<typeof FormSelect>, 'form' | 'name'> & {
            mode?: M;
            name: UpsertFieldPath<M, TCreateSchema, TUpdateSchema>;
        }) =>
            withRenderOrNot({
                mode,
                formMode: currentMode,
                component: <FormSelect form={selectedForm as any} {...props} />,
            }),
        [] // Remove dependencies to keep component definition stable
    );

    const SwitchComponent = useCallback(
        <M extends TComponentMode = 'both'>({
            mode,
            ...props
        }: Omit<React.ComponentProps<typeof FormSwitch>, 'form' | 'name'> & {
            mode?: M;
            name: UpsertFieldPath<M, TCreateSchema, TUpdateSchema>;
        }) =>
            withRenderOrNot({
                mode,
                formMode: currentMode,
                component: <FormSwitch form={selectedForm as any} {...props} />,
            }),
        [] // Remove dependencies to keep component definition stable
    );

    const RadioGroupComponent = useCallback(
        <M extends TComponentMode = 'both'>({
            mode,
            ...props
        }: Omit<React.ComponentProps<typeof FormRadioGroup>, 'form' | 'name'> & {
            mode?: M;
            name: UpsertFieldPath<M, TCreateSchema, TUpdateSchema>;
        }) =>
            withRenderOrNot({
                mode,
                formMode: currentMode,
                component: <FormRadioGroup form={selectedForm as any} {...props} />,
            }),
        [] // Remove dependencies to keep component definition stable
    );

    const CheckboxComponent = useCallback(
        <M extends TComponentMode = 'both'>({
            mode,
            ...props
        }: Omit<React.ComponentProps<typeof FormCheckbox>, 'form' | 'name'> & {
            mode?: M;
            name: UpsertFieldPath<M, TCreateSchema, TUpdateSchema>;
        }) =>
            withRenderOrNot({
                mode,
                formMode: currentMode,
                component: <FormCheckbox form={selectedForm as any} {...props} />,
            }),
        [] // Remove dependencies to keep component definition stable
    );

    const ColorSelectComponent = useCallback(
        <M extends TComponentMode = 'both'>({
            mode,
            ...props
        }: Omit<React.ComponentProps<typeof FormColorSelect>, 'form' | 'name'> & {
            mode?: M;
            name: UpsertFieldPath<M, TCreateSchema, TUpdateSchema>;
        }) =>
            withRenderOrNot({
                mode,
                formMode: currentMode,
                component: <FormColorSelect form={selectedForm as any} {...props} />,
            }),
        [] // Remove dependencies to keep component definition stable
    );

    //============================================
    // Return
    //============================================

    return {
        form: currentMode === 'update' ? updateForm.form : createForm.form,
        upsert: {
            mode: currentMode,
            isCreate: currentMode === 'create',
            isUpdate: currentMode === 'update',
            switchToCreate,
            switchToUpdate,
            toggleMode,
        },

        // components
        Form: currentMode === 'update' ? updateForm.Form : createForm.Form,
        SubmitButton: currentMode === 'update' ? updateForm.SubmitButton : createForm.SubmitButton,
        Input: InputComponent,
        Textarea: TextareaComponent,
        Select: SelectComponent,
        Switch: SwitchComponent,
        RadioGroup: RadioGroupComponent,
        Checkbox: CheckboxComponent,
        ColorSelect: ColorSelectComponent,
    };
};
