import type { FileUpload } from '../../../types';
import { FileCard } from './file-card';

interface FileListProps {
    files: FileUpload[];
    completedFilesCount: number;
    onRetry: (fileId: string) => void;
    onRemove: (fileId: string) => void;
    onDownload?: (fileUpload: FileUpload) => void;
}

export const FileList = ({
    files,
    completedFilesCount,
    onRetry,
    onRemove,
    onDownload,
}: FileListProps) => {
    if (files.length === 0) return null;

    return (
        <div className="space-y-2 w-full max-w-full">
            <h3 className="font-semibold text-gray-900">
                Uploaded Files ({completedFilesCount}/{files.length})
            </h3>

            <div className="space-y-3 w-full">
                {files.map((fileUpload) => (
                    <FileCard
                        key={fileUpload.id}
                        fileUpload={fileUpload}
                        onRetry={onRetry}
                        onRemove={onRemove}
                        onDownload={onDownload}
                    />
                ))}
            </div>
        </div>
    );
};
