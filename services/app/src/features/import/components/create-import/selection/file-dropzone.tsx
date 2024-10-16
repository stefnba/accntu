import Dropzone from '@/components/ui/dropzone';
import { FormDescription, FormLabel } from '@/components/ui/form';
import { FileWithPath, useDropzone } from 'react-dropzone';
import { UseFormReturn } from 'react-hook-form';
import toast from 'react-hot-toast';
import { z } from 'zod';

import { CreateImportSelectionSchema } from '../../../schema/create-import';
import { DroppedFileCard } from './dropped-file-card';

interface Props {
    form: UseFormReturn<
        z.infer<typeof CreateImportSelectionSchema>,
        any,
        undefined
    >;
}

export const CreateImportFileDropzone: React.FC<Props> = ({ form }) => {
    const files = form.getValues('files') || [];

    const { getRootProps, getInputProps } = useDropzone({
        multiple: true,
        maxFiles: 10,
        maxSize: 1024 * 1024 * 10,
        accept: {
            'application/vnd.ms-excel': ['.xls', '.xlsx'],
            'text/csv': ['.csv']
        },
        onDropRejected() {
            toast.error(
                'Invalid file type. Please upload a valid file. Only CSV and Excel files are allowed.'
            );
        },
        onDropAccepted(acceptedFiles) {
            if (acceptedFiles.length === 0) {
                return;
            }

            // ensure no duplicates
            const filesToUpload = acceptedFiles
                .filter((file: FileWithPath) => {
                    return !files.find((f) => f.path === file.path);
                })
                .map((file: FileWithPath) => file);

            if (filesToUpload.length === 0) {
                toast.error('File already selected');
                return;
            }

            // add file to form
            form.setValue('files', [...files, ...filesToUpload], {
                shouldValidate: true
            });
        }
    });

    return (
        <div>
            <FormLabel>Files</FormLabel>
            <FormDescription>
                You can upload up to 5 CSV or Excel files.
            </FormDescription>
            <div className="grid grid-cols-1 gap-2 mt-4">
                {files.map((file) => (
                    <DroppedFileCard form={form} key={file.path} file={file} />
                ))}
            </div>
            <Dropzone
                className="mt-4"
                name="D"
                rootProps={getRootProps}
                inputProps={getInputProps}
                isDragActive={true}
            />
        </div>
    );
};
