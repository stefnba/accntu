'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { IconCloudUpload, IconPhoto } from '@tabler/icons-react';
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';

interface FileDropzoneProps {
    onFileSelect: (file: File, previewUrl: string) => void;
    accept?: Record<string, string[]>;
    maxSize?: number;
}

export function ProfilePictureUpdateFileDropzone({
    onFileSelect,
    accept = {
        'image/jpeg': ['.jpeg', '.jpg'],
        'image/png': ['.png'],
        'image/webp': ['.webp'],
        'image/gif': ['.gif'],
    },
    maxSize = 5 * 1024 * 1024, // 5MB
}: FileDropzoneProps) {
    const [isDragActive, setIsDragActive] = useState(false);

    const validateFile = useCallback(
        (file: File): boolean => {
            // Check file type
            const isValidType = Object.keys(accept).includes(file.type);
            if (!isValidType) {
                toast.error('Please upload a valid image file (JPEG, PNG, WebP, or GIF)');
                return false;
            }

            // Check file size
            if (file.size > maxSize) {
                toast.error(`File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`);
                return false;
            }

            return true;
        },
        [accept, maxSize]
    );

    const onDrop = useCallback(
        (acceptedFiles: File[]) => {
            setIsDragActive(false);

            if (acceptedFiles.length === 0) return;

            const file = acceptedFiles[0];

            if (!validateFile(file)) return;

            // Create preview URL
            const previewUrl = URL.createObjectURL(file);
            onFileSelect(file, previewUrl);
        },
        [onFileSelect, validateFile]
    );

    const {
        getRootProps,
        getInputProps,
        isDragActive: dropzoneIsDragActive,
    } = useDropzone({
        onDrop,
        accept,
        maxFiles: 1,
        maxSize,
        onDragEnter: () => setIsDragActive(true),
        onDragLeave: () => setIsDragActive(false),
    });

    const isActive = isDragActive || dropzoneIsDragActive;

    return (
        <Card
            className={`transition-colors ${isActive ? 'border-primary bg-primary/5' : 'border-dashed'}`}
        >
            <CardContent className="p-6">
                <div {...getRootProps()} className="cursor-pointer">
                    <input {...getInputProps()} />

                    <div className="flex flex-col items-center justify-center space-y-4 text-center">
                        <div
                            className={`transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground'}`}
                        >
                            {isActive ? (
                                <IconCloudUpload className="w-12 h-12" />
                            ) : (
                                <IconPhoto className="w-12 h-12" />
                            )}
                        </div>

                        <div className="space-y-2">
                            <p className="text-lg font-medium">
                                {isActive ? 'Drop your image here' : 'Choose or drag an image'}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                JPEG, PNG, WebP, or GIF up to {Math.round(maxSize / 1024 / 1024)}MB
                            </p>
                        </div>

                        <Button type="button" variant="outline">
                            <IconPhoto className="w-4 h-4 mr-2" />
                            Select Image
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
