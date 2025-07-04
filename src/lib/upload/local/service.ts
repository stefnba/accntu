import { LOCAL_UPLOAD_BASE_DIR, type LocalUploadConfig } from '@/lib/upload/local/config';
import { generateRandonFileName } from '@/lib/upload/utils';
import fs from 'fs/promises';
import path from 'path';

type TWriteFileToDiskParams = {
    filePath?: string | string[];
    fileName?: string;
    fileExtension?: string;
    file: Buffer | string;
    config?: Omit<LocalUploadConfig, 'preserveFileName'>;
};

/**
 * Build a file path for a file to be written to disk.
 * @param params - The params to build the file path.
 * @returns The path to the file.
 */
const buildFilePath = (params: TWriteFileToDiskParams) => {
    const { baseDir } = params.config || {
        baseDir: LOCAL_UPLOAD_BASE_DIR,
    };

    let _filePath = path.join(
        baseDir,
        Array.isArray(params.filePath) ? path.join(...params.filePath) : params.filePath || ''
    );

    // add file name
    _filePath = path.join(_filePath, params.fileName || generateRandonFileName());

    // add file extension if it doesn't exist
    if (params.fileExtension && !path.extname(_filePath)) {
        _filePath = `${_filePath}.${params.fileExtension}`;
    }

    return _filePath;
};

/**
 * Write a file to disk.
 * @param params - The parameters for writing the file to disk.
 * @returns The path to the file.
 */
const writeFileToDisk = async (params: TWriteFileToDiskParams): Promise<string> => {
    const { createDirectories } = params.config || {
        createDirectories: true,
    };

    const filePath = buildFilePath(params);
    const dirPath = path.dirname(filePath);

    // create directories if they don't exist
    if (createDirectories) {
        await fs.mkdir(dirPath, { recursive: true });
    }

    await fs.writeFile(filePath, params.file);

    return filePath;
};

/**
 * Delete a file from disk.
 * @param filePath - The path to the file.
 * @returns The path to the file.
 */
const deleteFileFromDisk = async ({ filePath }: { filePath: string }) => {
    try {
        await fs.unlink(filePath);
    } catch (error: any) {
        // If the file does not exist, we don't need to throw an error.
        if (error.code !== 'ENOENT') {
            throw error;
        }
    }
};

/**
 * Creates a temporary file, executes a function with the file path, and then deletes the file.
 * @param fileParams - The parameters for creating the file.
 * @param fn - The function to execute with the temporary file's path.
 * @returns The result of the executed function.
 */
const createTempFileForFn = async <T>(
    fileParams: TWriteFileToDiskParams,
    fn: (filePath: string) => Promise<T>
): Promise<T> => {
    const filePath = await writeFileToDisk(fileParams);

    try {
        return await fn(filePath);
    } finally {
        await deleteFileFromDisk({ filePath });
    }
};

export const localUploadService = {
    writeFileToDisk,
    deleteFileFromDisk,
    createTempFileForFn,
};
