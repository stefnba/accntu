import { type UseZodFormOptions, UseZodFormReturn, useForm } from '@/components/form/hooks';
import { FormInput } from '@/components/form/input';
import { useState } from 'react';
import { FieldValues } from 'react-hook-form';
import { z } from 'zod';

type UpsertMode = 'create' | 'update';

type UnionToIntersection<U> = (U extends any ? (x: U) => void : never) extends (x: infer I) => void
    ? I
    : never;

// Simple input wrapper - no complex generics
const UpsertInput = (props: {
    mode: UpsertMode;
    form: UseZodFormReturn<any, any, any>;
    name: string;
    label?: string;
    [key: string]: unknown;
}) => {
    return <FormInput {...props} />;
};

// const Hi = () => {
//     const createFormResult = useUpsertForm({
//         create: {
//             schema: z.object({
//                 name: z.string(),
//             }),
//         },
//         update: {
//             schema: z.object({
//                 name: z.string(),
//             }),
//         },
//         mode: 'create',
//     });
//     return (
//         <div>
//             <UpsertInput mode="create" form={createFormResult.form} name="name" />
//         </div>
//     );
// };

/**
 * Create a form that can be used to upsert a resource with mode-aware components.
 *
 * Components support mode props:
 * - <Input mode="create" name="name" /> ✅
 * - <Input mode="create" name="age" /> ❌ TypeScript error
 * - <Input mode="update" name="age" /> ✅
 */
export const useUpsertForm = <
    TCreateSchema extends z.ZodType<FieldValues, FieldValues> = z.ZodType<FieldValues, FieldValues>,
    TUpdateSchema extends z.ZodType<FieldValues, FieldValues> = z.ZodType<FieldValues, FieldValues>,
    const TMode extends UpsertMode = UpsertMode,
>(params: {
    create: {
        schema: TCreateSchema;
    } & UseZodFormOptions<z.input<TCreateSchema>, z.output<TCreateSchema>>;
    update: {
        schema: TUpdateSchema;
    } & UseZodFormOptions<z.input<TUpdateSchema>, z.output<TUpdateSchema>>;
    mode: TMode;
    onModeChange?: (mode: UpsertMode) => void;
    defaultMode?: UpsertMode;
}) => {
    const { create, update, mode, onModeChange, defaultMode = 'create' } = params;

    const isControlled = mode !== undefined;
    const [internalMode, setInternalMode] = useState<UpsertMode>(defaultMode);
    const currentMode = isControlled ? mode : internalMode;

    const formMapping = {
        create: useForm(create),
        update: useForm(update),
    } as const;

    // // Get active form result for current mode
    // const activeFormResult = formMapping[currentMode];

    // /**
    //  * Switch to create mode.
    //  */
    // const switchToCreate = useCallback(() => {
    //     if (isControlled) {
    //         onModeChange?.('create');
    //     } else {
    //         setInternalMode('create');
    //     }
    // }, [isControlled, onModeChange]);

    // /**
    //  * Switch to update mode.
    //  */
    // const switchToUpdate = useCallback(() => {
    //     if (isControlled) {
    //         onModeChange?.('update');
    //     } else {
    //         setInternalMode('update');
    //     }
    // }, [isControlled, onModeChange]);

    // /**
    //  * Toggle the mode between create and update.
    //  */
    // const toggleMode = useCallback(() => {
    //     if (currentMode === 'create') {
    //         switchToUpdate();
    //     } else {
    //         switchToCreate();
    //     }
    // }, [currentMode, switchToCreate, switchToUpdate]);

    // /**
    //  * Trigger the active form when mode changes.
    //  */
    // useEffect(() => {
    //     const timeoutId = setTimeout(() => {
    //         activeFormResult.form.trigger();
    //     }, 0);
    //     return () => clearTimeout(timeoutId);
    // }, [currentMode, activeFormResult]);

    // // const SubmitButton = useCallback(
    // //     (props: { children?: React.ReactNode; [key: string]: unknown }) => {
    // //         if (currentMode === 'create') {
    // //             return <FormSubmitButton form={createFormResult.form} {...props} />;
    // //         } else {
    // //             return <FormSubmitButton form={updateFormResult.form} {...props} />;
    // //         }
    // //     },
    // //     [createFormResult.form, updateFormResult.form, currentMode]
    // // );

    // const Form = useCallback(
    //     (props: Parameters<typeof createFormResult.Form>[0]) => {
    //         if (currentMode === 'create') {
    //             return <createFormResult.Form key={currentMode} {...props} />;
    //         } else {
    //             return <updateFormResult.Form key={currentMode} {...props} />;
    //         }
    //     },
    //     [createFormResult, updateFormResult, currentMode]
    // );

    // // Simple Input component - no complex overloads
    // const Input = useCallback(
    //     (
    //         props: {
    //             mode: UpsertMode;
    //             name: Path<z.input<TCreateSchema>> | Path<z.input<TUpdateSchema>>;
    //         } & Omit<React.ComponentProps<typeof UpsertInput>, 'mode' | 'name'>
    //     ) => {
    //         const { mode, name, ...restProps } = props;

    //         // Select form based on mode
    //         if (mode === 'create') {
    //             return (
    //                 <UpsertInput
    //                     mode="create"
    //                     form={createFormResult.form}
    //                     name={name}
    //                     {...restProps}
    //                 />
    //             );
    //         } else if (mode === 'update') {
    //             return (
    //                 <UpsertInput
    //                     mode="update"
    //                     form={updateFormResult.form}
    //                     name={name}
    //                     {...restProps}
    //                 />
    //             );
    //         } else {
    //             // 'both' mode uses current active form
    //             const activeForm =
    //                 currentMode === 'create' ? createFormResult.form : updateFormResult.form;
    //             return <UpsertInput mode={mode} form={activeForm} name={name} {...restProps} />;
    //         }
    //     },
    //     [createFormResult.form, updateFormResult.form, currentMode]
    // );

    return {
        form: formMapping[currentMode].form as UnionToIntersection<
            UseZodFormReturn<
                z.input<TCreateSchema>,
                z.output<TCreateSchema>,
                z.input<TUpdateSchema>
            >
        >,
        upsert: {
            mode: currentMode,
            isCreate: currentMode === 'create',
            isUpdate: currentMode === 'update',
        },
        Input: formMapping[currentMode].Input,
        Form: formMapping[currentMode].Form,
        SubmitButton: formMapping[currentMode].SubmitButton,
        Textarea: formMapping[currentMode].Textarea,
    };
};
