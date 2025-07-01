export type TFileUploadStatus = 'pending' | 'uploading' | 'completed' | 'error';

export interface FileUpload {
    id: string;
    file: File;
    progress: number;
    status: TFileUploadStatus;
    error?: string;
    uploadUrl?: string;
    s3Key?: string;
    fileId?: string; // Database file ID
}
