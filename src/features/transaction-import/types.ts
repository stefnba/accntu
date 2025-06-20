export interface FileUpload {
    id: string;
    file: File;
    progress: number;
    status: 'pending' | 'uploading' | 'completed' | 'error';
    error?: string;
    uploadUrl?: string;
    s3Key?: string;
}
