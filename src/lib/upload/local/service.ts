import { withDbQuery } from '@/server/lib/handler';
import fs from 'fs/promises';
import path from 'path';
import { generateRandomFileName } from '@/features/upload/lib/utils';
import { createUploadSchemas, type UploadConfig } from '@/features/upload/schemas';
import type { LocalUploadConfig } from './config';

export const createLocalUploadService = (config: UploadConfig, localConfig: LocalUploadConfig) => {
    const { CreateSignedUrlSchema, DeleteFileSchema } = createUploadSchemas(config);

    const ensureDirectoryExists = async (dirPath: string) => {
        if (localConfig.createDirectories) {
            await fs.mkdir(dirPath, { recursive: true });
        }
    };

    const uploadFile = async ({
        file,
        fileName,
        userId,
        subDirectory
    }: {
        file: File;
        fileName?: string;
        userId: string;
        subDirectory?: string;
    }) => {
        return withDbQuery({
            operation: 'upload file locally',
            queryFn: async () => {
                const validatedData = CreateSignedUrlSchema.parse({
                    fileType: file.type,
                    fileSize: file.size,
                    checksum: '', // Local uploads don't require checksum
                    fileName,
                    bucket: 'local' // Use 'local' as bucket identifier
                });

                const finalFileName = localConfig.preserveFileName && fileName 
                    ? fileName 
                    : generateRandomFileName() + path.extname(fileName || '');

                const userDir = path.join(localConfig.baseDir, userId);
                const uploadDir = subDirectory ? path.join(userDir, subDirectory) : userDir;
                
                await ensureDirectoryExists(uploadDir);

                const filePath = path.join(uploadDir, finalFileName);
                const buffer = Buffer.from(await file.arrayBuffer());
                
                await fs.writeFile(filePath, buffer);

                return {
                    filePath: filePath,
                    fileName: finalFileName,
                    relativePath: path.relative(localConfig.baseDir, filePath),
                    size: file.size,
                    type: file.type
                };
            },
        });
    };

    const deleteFile = async ({
        filePath,
        relativePath
    }: {
        filePath?: string;
        relativePath?: string;
    }) => {
        return withDbQuery({
            operation: 'delete local file',
            queryFn: async () => {
                const fullPath = filePath || path.join(localConfig.baseDir, relativePath!);
                
                try {
                    await fs.unlink(fullPath);
                    return { success: true };
                } catch (error) {
                    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
                        return { success: true, message: 'File already deleted' };
                    }
                    throw error;
                }
            },
        });
    };

    const getFileInfo = async ({
        filePath,
        relativePath
    }: {
        filePath?: string;
        relativePath?: string;
    }) => {
        return withDbQuery({
            operation: 'get local file info',
            queryFn: async () => {
                const fullPath = filePath || path.join(localConfig.baseDir, relativePath!);
                
                try {
                    const stats = await fs.stat(fullPath);
                    return {
                        exists: true,
                        size: stats.size,
                        createdAt: stats.birthtime,
                        modifiedAt: stats.mtime,
                        path: fullPath,
                        relativePath: path.relative(localConfig.baseDir, fullPath)
                    };
                } catch (error) {
                    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
                        return { exists: false };
                    }
                    throw error;
                }
            },
        });
    };

    return {
        uploadFile,
        deleteFile,
        getFileInfo,
        config,
        localConfig
    };
};