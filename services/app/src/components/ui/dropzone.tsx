/*
Custom dropzone component, not from shadcn/ui.
*/
import { cn } from '@/lib/utils';
import { LuUpload } from 'react-icons/lu';

interface Props {
    name: string;
    title?: string | null;
    description?: string;
    showIcon?: boolean;
    rootProps: any;
    inputProps: any;
    isDragActive: boolean;
    className?: string;
}

export default function Dropzone({
    name,
    title = 'Drag & drop your file here, or click to browse files',
    description,
    showIcon = true,
    rootProps,
    inputProps,
    isDragActive,
    className
}: Props) {
    return (
        <div
            className={cn('flex w-full items-center justify-center', className)}
        >
            <div
                className="dark:hover:bg-bray-800 flex h-full w-full cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 py-6 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:hover:border-gray-500 dark:hover:bg-gray-600"
                {...rootProps()}
            >
                <input name={name} id={name} {...inputProps()} />
                {showIcon && (
                    <LuUpload className=" h-8 w-8 text-gray-500 dark:text-gray-400" />
                )}
                {title && (
                    <p className="mb-2 mt-6 text-gray-500 dark:text-gray-400">
                        {isDragActive ? 'Drop your files here' : title}
                    </p>
                )}
                {description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {description}
                    </p>
                )}
            </div>
        </div>
    );
}
