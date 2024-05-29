'use client';

import Dropzone from '@/components/ui/dropzone';
import React, { useCallback, useEffect, useState } from 'react';
import { FileWithPath, useDropzone } from 'react-dropzone';
import {
    FieldPath,
    FieldValues,
    Path,
    PathValue,
    UseFormReturn
} from 'react-hook-form';

import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from '../ui/form';

type Props<
    TFieldValues extends FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = {
    name: TName;
    form: UseFormReturn<TFieldValues>;
    maxFiles?: number;
    onDropSuccess?: (files: FileWithPath[]) => void;
    /** Custom render function for outside of FormFileDropzone. */
    fileRender?: (files: FileWithPath[]) => React.ReactNode;
    className?: string;
    label?: string;
};

export default function FormFileDropzone<TFieldValues extends FieldValues>({
    name,
    form,
    maxFiles = 1,
    onDropSuccess,
    className,
    label,
    fileRender
}: Props<TFieldValues>) {
    const { register, unregister, setValue, control } = form;

    const [files, setFiles] = useState<FileWithPath[]>([]);

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
            setFiles(droppedFiles);
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
        <div>
            <FormField
                control={control}
                name={name}
                render={({ field }) => (
                    <FormItem>
                        {label && <FormLabel>{label}</FormLabel>}
                        <FormControl>
                            <Dropzone
                                className={className}
                                name={field.name}
                                isDragActive={isDragActive}
                                inputProps={getInputProps}
                                rootProps={getRootProps}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            {fileRender && fileRender(files)}
        </div>
    );
}
