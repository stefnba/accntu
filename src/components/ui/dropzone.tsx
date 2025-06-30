'use client';

import { cn } from '@/lib/utils';
import * as React from 'react';
import { LuUpload } from 'react-icons/lu';

type DropzoneProps = Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> & {
    name: string;
    title?: string | null;
    description?: string;
    showIcon?: boolean;
    rootProps: () => any;
    inputProps: () => any;
    isDragActive: boolean;
    className?: string;
};

const Dropzone = React.forwardRef<HTMLDivElement, DropzoneProps>(
    (
        {
            name,
            title = 'Drag & drop your file here, or click to browse files',
            description,
            showIcon = true,
            rootProps,
            inputProps,
            isDragActive,
            className,
            ...props
        },
        ref
    ) => {
        return (
            <div
                ref={ref}
                className={cn('flex w-full items-center justify-center', className)}
                {...props}
            >
                <div
                    className={cn(
                        'flex h-full w-full cursor-pointer flex-col items-center justify-center rounded-md border border-dashed py-6',
                        isDragActive
                            ? 'border-primary/50 bg-primary/5'
                            : 'border-muted-foreground/25 bg-background hover:bg-accent/5',
                        'px-4 py-6'
                    )}
                    {...rootProps()}
                >
                    <input name={name} id={name} className="sr-only" {...inputProps()} />
                    {showIcon && <LuUpload className="size-8 text-gray-500 dark:text-gray-400" />}
                    {title && (
                        <p className="mb-2 mt-4 text-sm font-medium">
                            {isDragActive ? 'Drop your files here' : title}
                        </p>
                    )}
                    {description && <p className="text-xs text-muted-foreground">{description}</p>}
                </div>
            </div>
        );
    }
);

Dropzone.displayName = 'Dropzone';

export { Dropzone };
