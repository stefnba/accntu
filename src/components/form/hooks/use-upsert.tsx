import { useForm } from '@/components/form/hooks';
import { FormInput } from '@/components/form/input';
import React, { useCallback } from 'react';
import { FieldValues } from 'react-hook-form';
import { z } from 'zod/v4';
import type { TComponentMode, TFormMode, UpsertFieldPath, UseUpsertFormConfig } from './types';

// function withUpsertMode<P extends { name: string; mode: TComponentMode; formMode: TFormMode }>(
//     Component: React.ComponentType<P & { form: any }>
// ) {
//     return React.forwardRef<
//         React.ComponentRef<
//             React.ComponentType<P & { form: any } & { mode: TComponentMode; formMode: TFormMode }>
//         >,
//         Omit<P, 'form'> & {
//             form: any;
//             mode?: TComponentMode;
//             formMode: TFormMode; // Current form mode from hook
//         }
//     >((props, ref) => {
//         const { mode = 'both', formMode, ...componentProps } = props;

//         // Your conditional logic extracted here!
//         if (mode !== 'both' && mode !== formMode) {
//             return null;
//         }

//         return React.createElement(Component, {
//             ...componentProps,
//             form: props.form,
//             ref,
//         } as P & { form: any });
//     });
// }

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
        }) => {
            const _mode = mode ?? 'both';
            // hide the input if the mode does not match the form mode
            if (_mode !== 'both' && _mode !== formMode) {
                return null;
            }
            // is safe here because
            return <FormInput form={selectedForm as any} {...props} />;
        },
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
        Input: InputComponent,
        Form: formMode === 'update' ? updateForm.Form : createForm.Form,
        SubmitButton: formMode === 'update' ? updateForm.SubmitButton : createForm.SubmitButton,
    };
};
