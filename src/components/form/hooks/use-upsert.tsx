import { FormCheckbox } from '@/components/form/checkbox';
import { useForm } from '@/components/form/hooks';
import { FormInput } from '@/components/form/input';
import { FormRadioGroup } from '@/components/form/radio-group';
import { FormSelect } from '@/components/form/select';
import { FormSwitch } from '@/components/form/switch';
import { FormTextarea } from '@/components/form/textarea';
import React, { useCallback } from 'react';
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
    const { mode, formMode, component } = args;

    if (mode === 'both' || mode === formMode) {
        return component;
    }
    return null;
};

/**
 * Main hook: useUpsertNew
 * - Accepts create & update schemas
 * - Builds three form instances: create, update and both (derived)
 * - Returns a `form` (selected by runtime mode), the `Input` helper, and the create Form wrapper
 */
export const useUpsertForm = <
    TCreateSchema extends z.ZodType<FieldValues, FieldValues>,
    TUpdateSchema extends z.ZodType<FieldValues, FieldValues>,
    TMode extends TFormMode = 'create',
>(
    config: UseUpsertFormConfig<TMode, TCreateSchema, TUpdateSchema>
) => {
    const { create, update, mode: formMode = 'create' } = config;

    //============================================
    // Form selection
    //============================================

    const createForm = useForm(create);
    const updateForm = useForm(update);
    const selectedForm = formMode === 'update' ? updateForm.form : createForm.form;

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
                formMode,
                component: <FormInput form={selectedForm as any} {...props} />,
            }),
        [selectedForm]
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
                formMode,
                component: <FormTextarea form={selectedForm as any} {...props} />,
            }),
        [selectedForm]
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
                formMode,
                component: <FormSelect form={selectedForm as any} {...props} />,
            }),
        [selectedForm]
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
                formMode,
                component: <FormSwitch form={selectedForm as any} {...props} />,
            }),
        [selectedForm]
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
                formMode,
                component: <FormRadioGroup form={selectedForm as any} {...props} />,
            }),
        [selectedForm]
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
                formMode,
                component: <FormCheckbox form={selectedForm as any} {...props} />,
            }),
        [selectedForm]
    );

    //============================================
    // Return
    //============================================

    return {
        form: formMode === 'update' ? updateForm.form : createForm.form,
        upsert: {
            mode: formMode,
            isCreate: formMode === 'create',
            isUpdate: formMode === 'update',
        },

        // components
        Form: formMode === 'update' ? updateForm.Form : createForm.Form,
        SubmitButton: formMode === 'update' ? updateForm.SubmitButton : createForm.SubmitButton,
        Input: InputComponent,
        Textarea: TextareaComponent,
        Select: SelectComponent,
        Switch: SwitchComponent,
        RadioGroup: RadioGroupComponent,
        Checkbox: CheckboxComponent,
    };
};
