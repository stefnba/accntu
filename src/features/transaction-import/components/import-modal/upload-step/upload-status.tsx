interface UploadStatusProps {
    filesCount: number;
    hasErrors: boolean;
}

export const UploadStatus = ({ filesCount, hasErrors }: UploadStatusProps) => {
    if (filesCount === 0) return null;

    return (
        <div className="text-center text-sm text-gray-500">
            {hasErrors && (
                <p className="text-red-600 mb-2">
                    Some files failed to upload. You can retry individual files or remove them.
                </p>
            )}
            <p>Upload files containing transaction data from your bank statements</p>
        </div>
    );
};
