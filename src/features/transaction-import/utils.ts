import { File, FileSpreadsheet } from 'lucide-react';

/**
 * Get the appropriate icon component for a file based on its type
 */
export const getFileIconComponent = (file: File) => {
    if (file.type.includes('csv') || file.name.endsWith('.csv')) {
        return FileSpreadsheet;
    }
    return File;
};

/**
 * Format file size in a human-readable format
 * @param bytes - The file size in bytes
 * @returns The file size in a human-readable format
 */
export const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) {
        return `${bytes} B`;
    }
    if (bytes < 1024 * 1024) {
        return `${(bytes / 1024).toFixed(2)} KB`;
    }
    if (bytes < 1024 * 1024 * 1024) {
        return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
    }
    return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
};

/**
 * Generate a unique file ID
 */
export const generateFileId = (): string => {
    return `${Date.now()}-${Math.random()}`;
};
