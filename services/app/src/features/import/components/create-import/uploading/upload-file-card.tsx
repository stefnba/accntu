import { useUploadImportFile } from '@/features/import/api/upload-import-file';
import { FileCard } from '@/features/import/components/file-card';
import { useEffect } from 'react';
import { FileWithPath } from 'react-dropzone';
import { AiOutlineLoading } from 'react-icons/ai';
import { LuCheck } from 'react-icons/lu';

interface Props {
    file: FileWithPath;
    importId: string;
}

/**
 * One card for uploading a import file.
 */
export const UploadFileCard: React.FC<Props> = ({ file, importId }) => {
    const { mutate: uploadFileMutate, isPending: uploadIsPending } =
        useUploadImportFile(importId);

    useEffect(() => {
        uploadFileMutate(file);
    }, [uploadFileMutate, file]);

    return (
        <FileCard
            name={file.name}
            type={file.type}
            action={
                uploadIsPending ? (
                    <AiOutlineLoading className="animate-spin" />
                ) : (
                    <LuCheck className="text-green-600 size-6" />
                )
            }
        />
    );
};
