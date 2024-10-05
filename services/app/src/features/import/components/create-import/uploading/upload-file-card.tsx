import { useUploadImportFile } from '@/features/import/api/upload-import-file';
import { FileCard } from '@/features/import/components/file-card';
import { storeCreateImportData } from '@/features/import/store/create-import-data';
import { useEffect, useRef } from 'react';
import { FileWithPath } from 'react-dropzone';
import { AiOutlineLoading } from 'react-icons/ai';
import { LuCheck } from 'react-icons/lu';

interface Props {
    file: FileWithPath;
}

/**
 * One card for uploading a import file.
 */
export const UploadFileCard: React.FC<Props> = ({ file }) => {
    const hasFired = useRef(false);
    const { importId } = storeCreateImportData();
    const { mutate: uploadFileMutate, isPending: uploadIsPending } =
        useUploadImportFile();

    useEffect(() => {
        if (!hasFired.current && importId) {
            uploadFileMutate({ file, importId });
            hasFired.current = true;
        }
    }, [uploadFileMutate, file, importId]);

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
