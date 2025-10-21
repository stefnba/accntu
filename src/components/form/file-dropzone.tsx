'use client';

import { UseZodFormReturn } from '@/components/form/hooks/use-form';
import { Dropzone } from '@/components/ui/dropzone';
import {
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { useCallback } from 'react';
import { FileWithPath, useDropzone } from 'react-dropzone';
import { FieldPath, FieldValues } from 'react-hook-form';

export type FileDropzoneProps<
    TFieldValues extends FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
    form: UseZodFormReturn<TFieldValues>;
    name: TName;
    label?: string;
    description?: string;
    maxFiles?: number;
    maxSize?: number;
    accept?: Record<string, string[]>;
    showIcon?: boolean;
    dropzoneTitle?: string | null;
    dropzoneDescription?: string;
    hideError?: boolean;
    className?: string;
    onChange?: (files: FileWithPath[]) => void;
};

export function FormFileDropzone<
    TFieldValues extends FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
    form,
    name,
    label,
    description,
    maxFiles = 1,
    maxSize = 5242880, // 5MB
    accept,
    showIcon = true,
    dropzoneTitle,
    dropzoneDescription,
    hideError = false,
    className,
    onChange,
}: FileDropzoneProps<TFieldValues, TName>) {
    const onDrop = useCallback(
        (acceptedFiles: FileWithPath[]) => {
            form.setValue(name, acceptedFiles as any, {
                shouldValidate: true,
                shouldDirty: true,
                shouldTouch: true,
            });
            if (onChange) {
                onChange(acceptedFiles);
            }
        },
        [form, name, onChange]
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        maxFiles,
        maxSize,
        accept,
    });

    return (
        <FormField
            control={form.control}
            name={name}
            render={({ field }) => (
                <FormItem className={className}>
                    {label && <FormLabel>{label}</FormLabel>}
                    {description && <FormDescription>{description}</FormDescription>}
                    <FormControl>
                        <Dropzone
                            name={name}
                            rootProps={getRootProps}
                            inputProps={getInputProps}
                            isDragActive={isDragActive}
                            title={dropzoneTitle}
                            description={dropzoneDescription}
                            showIcon={showIcon}
                        />
                    </FormControl>
                    {!hideError && <FormMessage />}
                </FormItem>
            )}
        />
    );
}
