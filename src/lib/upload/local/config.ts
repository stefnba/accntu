import path from 'path';

/**
 * The base directory for local uploads.
 */
export const LOCAL_UPLOAD_BASE_DIR = 'uploads';

/**
 * The local upload config.
 */
export interface LocalUploadConfig {
    baseDir: string;
    createDirectories?: boolean;
    preserveFileName?: boolean;
}

/**
 * Create a local upload config.
 * @param config - The config to create the local upload config.
 * @returns The local upload config.
 */
export const createLocalUploadConfig = (
    config?: Partial<LocalUploadConfig>
): LocalUploadConfig => ({
    baseDir: config?.baseDir || path.join(process.cwd(), LOCAL_UPLOAD_BASE_DIR),
    createDirectories: config?.createDirectories ?? true,
    preserveFileName: config?.preserveFileName ?? false,
});
