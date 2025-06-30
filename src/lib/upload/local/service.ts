import { LOCAL_UPLOAD_BASE_DIR, type LocalUploadConfig } from '@/lib/upload/local/config';
import { generateRandonFileName } from '@/lib/upload/utils';
import fs from 'fs/promises';
import path from 'path';

/**
 * Write a file to disk.
 * @param filePath - The path to the file.
 * @param fileName - The name of the file.
 * @param file - The file to write to disk.
 * @param config - The config for the local upload service.
 * @returns The path to the file.
 */
const writeFileToDisk = async ({
    filePath,
    fileName,
    file,
    config,
    fileExtension,
}: {
    filePath?: string | string[];
    fileName?: string;
    fileExtension?: string;
    file: Buffer | string;
    config?: Omit<LocalUploadConfig, 'preserveFileName'>;
}): Promise<string> => {
    const { baseDir, createDirectories } = config || {
        baseDir: LOCAL_UPLOAD_BASE_DIR,
        createDirectories: true,
    };

    // only dir path
    let _filePath = path.join(
        baseDir,
        Array.isArray(filePath) ? path.join(...filePath) : filePath || ''
    );

    // create directories if they don't exist
    if (createDirectories) {
        await fs.mkdir(_filePath, { recursive: true });
    }

    // add file name
    _filePath = path.join(_filePath, fileName || generateRandonFileName());

    // add file extension if it doesn't exist
    if (fileExtension && !path.extname(_filePath)) {
        _filePath = `${_filePath}.${fileExtension}`;
    }

    await fs.writeFile(_filePath, file);

    return _filePath;
};

/**
 * Delete a file from disk.
 * @param filePath - The path to the file.
 * @returns The path to the file.
 */
const deleteFileFromDisk = async ({ filePath }: { filePath: string }) => {
    await fs.unlink(filePath);
};

export const localUploadService = {
    writeFileToDisk,
    deleteFileFromDisk,
};
