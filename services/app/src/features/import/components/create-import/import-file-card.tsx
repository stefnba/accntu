import { Button } from '@/components/ui/button';
import { useDeleteImportFile } from '@/features/import/api/delete-import-file';
import { useUploadImportFile } from '@/features/import/api/upload-import-file';
import { storeUploadImportFiles } from '@/features/import/store/upload-import-files';
import { useEffect, useState } from 'react';
import { FileWithPath } from 'react-dropzone';
import { IconType } from 'react-icons';
import { AiOutlineLoading } from 'react-icons/ai';
import { BsFileExcel, BsFiletypeCsv } from 'react-icons/bs';
import { LuCheck, LuTrash } from 'react-icons/lu';
import { useMountedState } from 'react-use';

interface Props {
    file: FileWithPath;
    handleDelete: (fileId: string) => void;
}

const FileIcon: React.FC<{ type: string }> = ({ type }) => {
    const Icons: Record<string, IconType> = {
        'application/vnd.ms-excel': BsFileExcel,
        'text/csv': BsFiletypeCsv
    };

    if (!(type in Icons)) {
        return null;
    }

    const Icon = Icons[type] || null;

    return <Icon className="text-2xl" />;
};

/**
 * Also handles upload of eact file.
 */
export const ImportFileCard: React.FC<Props> = ({ file }) => {
    const isMounted = useMountedState();
    const [fileId, setFileId] = useState<string | null>(null);
    const updateFileId = storeUploadImportFiles((state) => state.);
    const deleteFile = storeUploadImportFiles((state) => state.deleteFile);

    const { mutateAsync: mutateDeleteFile } = useDeleteImportFile();
    const { mutateAsync: mutateUploadFile, isPending: uploadIsPending } =
        useUploadImportFile();

    useEffect(() => {
        mutateUploadFile(file).then(({ id }) => {
            // set local fileId
            setFileId(id);

            // update fileId in the store
            updateFileId(id, file.path);
        });
    }, [mutateUploadFile, file, updateFileId]);

    const uploadingIcon = uploadIsPending ? (
        <AiOutlineLoading className="animate-spin" />
    ) : (
        <LuCheck className="text-green-600 size-6" />
    );

    /**
     * Delete the file from the server and file record.
     */
    const handleFileDelete = () => {
        if (!fileId) return;

        mutateDeleteFile({ id: fileId }).then(() => {
            deleteFile(fileId);
        });
    };

    return (
        <div className="border rounded-md p-2 flex items-center group h-14">
            <div className="mr-2">
                <FileIcon type={file.type} />
            </div>
            <div className="text-sm mr-8 text-muted-foreground overflow-hidden">
                {file.name}
            </div>
            <div className="ml-auto">
                <div className="group-hover:hidden h-10 w-10 inline-flex items-center justify-center">
                    {uploadingIcon}
                </div>
                <Button
                    size="icon"
                    variant={'ghost'}
                    className="group-hover:flex hidden text-red-500"
                    onClick={handleFileDelete}
                >
                    <LuTrash className="size-4" />
                </Button>
            </div>
        </div>
    );
};
