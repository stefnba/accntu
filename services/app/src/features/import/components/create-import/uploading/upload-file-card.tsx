import { useDeleteImportFile } from '@/features/import/api/delete-import-file';
import { useUploadImportFile } from '@/features/import/api/upload-import-file';
import { useEffect } from 'react';
import { FileWithPath } from 'react-dropzone';
import { AiOutlineLoading } from 'react-icons/ai';
import { LuCheck } from 'react-icons/lu';

import { FileCard } from '../file-card';

interface Props {
    file: FileWithPath;
    importId: string;
}

/**
 * One card for a upload file.
 */
export const UploadFileCard: React.FC<Props> = ({ file, importId }) => {
    const { mutate: uploadFile, isPending: uploadIsPending } =
        useUploadImportFile(importId);
    // const { mutate: deleteFile } = useDeleteImportFile();

    useEffect(() => {
        uploadFile(file);
    }, [uploadFile, file]);

    return (
        <FileCard
            file={file}
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
