'use client';

import Dropzone from '@/components/ui/dropzone';
import React, { useCallback, useEffect } from 'react';
import { FileWithPath, useDropzone } from 'react-dropzone';
import {
    FieldPath,
    FieldValues,
    Path,
    PathValue,
    UseFormReturn,
    useFormContext
} from 'react-hook-form';

import { FormField, FormItem, FormMessage } from '../ui/form';

type Props<
    TFieldValues extends FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = {
    name: TName;
    form: UseFormReturn<TFieldValues>;
    maxFiles?: number;
    onDropSuccess?: (files: FileWithPath[]) => void;
    className?: string;
};

export default function FormFileDropzone<TFieldValues extends FieldValues>({
    name,
    form,
    maxFiles = 1,
    onDropSuccess,
    className
}: Props<TFieldValues>) {
    const { register, unregister, setValue, control } = form;

    useEffect(() => {
        register(name);
        return () => {
            unregister(name);
        };
    }, [register, unregister, name]);

    const onDrop = useCallback(
        (droppedFiles: FileWithPath[]) => {
            console.log({ droppedFiles });

            if (droppedFiles.length === 0) {
                return;
            }

            // set form value
            setValue(
                name,
                (maxFiles === 1 ? droppedFiles[0] : droppedFiles) as PathValue<
                    TFieldValues,
                    Path<TFieldValues>
                >,
                { shouldValidate: true }
            );
            onDropSuccess?.(droppedFiles);
        },
        [setValue, name, maxFiles, onDropSuccess]
    );

    const { getRootProps, getInputProps, isDragActive, acceptedFiles } =
        useDropzone({
            onDrop,
            multiple: maxFiles > 1,
            maxFiles: maxFiles
        });

    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => (
                <FormItem>
                    <Dropzone
                        className={className}
                        name={field.name}
                        isDragActive={isDragActive}
                        inputProps={getInputProps}
                        rootProps={getRootProps}
                    />
                    <FormMessage />
                </FormItem>
            )}
        />
    );
}
