'use client';

import { useRouter } from 'next/navigation';

import { importActions } from '@/actions';
import { Button } from '@/components/ui/button';
import Dropzone from '@/components/ui/dropzone';
import { useToast } from '@/components/ui/use-toast';
import { useMutation } from '@/hooks/mutation';
import { createUploadRecord, getSignedS3Url } from '@/lib/upload/cloud/s3';
import { computeSHA256 } from '@/lib/upload/utils';
import { TransactionAccount } from '@prisma/client';
import { useState } from 'react';
import { FileWithPath, useDropzone } from 'react-dropzone';

import { FileCard } from './file-card';

export type UploadFile = {
    file: FileWithPath;
    fileId?: string; // file is uploaded if fileUrl is present
};

interface Props {
    account: TransactionAccount;
}

export const ImportUploadForm: React.FC<Props> = ({ account }) => {
    const [files, setFiles] = useState<UploadFile[]>([]);

    const router = useRouter();
    const { toast } = useToast();

    const { execute: createImport } = useMutation(importActions.create, {
        onSuccess({ id }) {
            router.push(`new?importId=${id}`);
        }
    });

    const { getRootProps, getInputProps } = useDropzone({
        multiple: true,
        maxFiles: 10,
        maxSize: 1024 * 1024 * 10,
        accept: {
            'application/vnd.ms-excel': ['.xls', '.xlsx'],
            'text/csv': ['.csv']
        },
        onDropRejected() {
            toast({
                title: 'Invalid file type.',
                description:
                    'Please upload a valid file. Only CSV and Excel files are allowed.'
            });
        },
        onDropAccepted(acceptedFiles) {
            if (acceptedFiles.length === 0) {
                return;
            }

            const filesToUpload = acceptedFiles
                .filter((file: FileWithPath) => {
                    return !files.find((f) => f.file.path === file.path);
                })
                .map((file) => ({
                    file
                }));

            if (filesToUpload.length === 0) {
                return;
            }

            // add to state
            setFiles([...files, ...filesToUpload]);

            // upload
            Promise.allSettled(
                filesToUpload.map(async (file: UploadFile) => {
                    console.log('file', file);

                    const signedS3Url = await getSignedS3Url({
                        fileType: file.file.type,
                        fileSize: file.file.size,
                        checksum: await computeSHA256(file.file)
                    });

                    if (!signedS3Url.success) {
                        console.error('here', signedS3Url.error);

                        toast({
                            title: 'Upload failed',
                            description: signedS3Url.error
                        });
                        return;
                    }

                    const { url } = signedS3Url.success;

                    fetch(url, {
                        method: 'PUT',
                        body: file.file,
                        headers: {
                            'Content-Type': file.file.type
                        }
                    })
                        .then(async (res) => {
                            if (res.ok) {
                                if (!file.file.path) return;

                                const fileId = await createUploadRecord({
                                    url: res.url.split('?')[0],
                                    type: file.file.type,
                                    filename: file.file.name
                                });

                                handleFileUpdate({
                                    ...file,
                                    fileId: fileId.data?.id
                                });
                            } else {
                                console.error(res);
                            }
                        })
                        .catch((err) => {
                            toast({
                                title: 'Upload failed',
                                description:
                                    'There was an error uploading the file.'
                            });
                            console.error(err);
                        });
                })
            );
        }
    });

    const handleFileUpdate = (file: UploadFile) => {
        setFiles((prev) => {
            return prev.map((f) => {
                if (f.file.path === file.file.path) {
                    return file;
                }
                return f;
            });
        });
    };

    const handleFileDelete = (fileId: string) => {
        setFiles((prev) => {
            return prev.filter((f) => f.fileId !== fileId);
        });
    };

    const handleContinue = () => {
        createImport({
            accountId: account.id,
            files: files.map((f) => f.fileId!)
        });
    };

    return (
        <div>
            <Dropzone
                name="files"
                isDragActive
                inputProps={getInputProps}
                rootProps={getRootProps}
            />
            <div className="grid grid-cols-2 gap-4 mt-4">
                {files.map((file) => (
                    <FileCard
                        handleDelete={handleFileDelete}
                        key={file.file.path}
                        file={file}
                    />
                ))}
            </div>
            <Button
                onClick={handleContinue}
                className="mt-4"
                disabled={files.length === 0 && !files.some((f) => !f.fileId)}
            >
                Continue
            </Button>
        </div>
    );
};
