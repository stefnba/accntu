import path from 'path';

export interface LocalUploadConfig {
    baseDir: string;
    createDirectories?: boolean;
    preserveFileName?: boolean;
}

export const createLocalUploadConfig = (config?: Partial<LocalUploadConfig>): LocalUploadConfig => ({
    baseDir: config?.baseDir || path.join(process.cwd(), 'uploads'),
    createDirectories: config?.createDirectories ?? true,
    preserveFileName: config?.preserveFileName ?? false,
});
