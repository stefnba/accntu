'use client';

import { Button } from '@/components/ui/button';
import { DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ResponsiveModal } from '@/components/ui/responsive-modal';
import { Separator } from '@/components/ui/separator';
import { useAuth, useAuthEndpoints } from '@/lib/auth/client';
import { uploadFileToS3WithSignedUrl } from '@/lib/upload/cloud/s3/services';
import { computeSHA256 } from '@/lib/upload/utils';
import { IconArrowLeft, IconCheck } from '@tabler/icons-react';
import { useCallback, useState } from 'react';
import toast from 'react-hot-toast';
import { useUserEndpoints } from '../../api';
import { FileDropzone } from './image-editor/file-dropzone';
import { ImageEditor, type ImageEditData } from './image-editor/image-editor';
import { UploadProgress } from './image-editor/upload-progress';

type ModalMode = 'upload' | 'edit';
type ModalStep = 'select' | 'edit' | 'uploading' | 'complete';

interface ProfileImageModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    mode: ModalMode;
}

export function ProfileImageModal({ open, onOpenChange, mode }: ProfileImageModalProps) {
    // ====================
    // Hooks
    // ====================

    const { user, refetchSession } = useAuth();

    // ====================
    // State
    // ====================
    const [step, setStep] = useState<ModalStep>('select');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [originalImageUrl, setOriginalImageUrl] = useState<string>('');
    const [processedImageUrl, setProcessedImageUrl] = useState<string>('');
    const [editData, setEditData] = useState<ImageEditData | null>(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadError, setUploadError] = useState<string>('');

    // ====================
    // API hooks
    // ====================
    const createSignedUrlMutation = useUserEndpoints.createS3SignedUrl();
    const updateUserMutation = useAuthEndpoints.updateUser();

    // ====================
    // Handlers
    // ====================

    // Reset modal state when closed
    const handleOpenChange = useCallback(
        (newOpen: boolean) => {
            if (!newOpen) {
                // Cleanup URLs to prevent memory leaks
                if (originalImageUrl) URL.revokeObjectURL(originalImageUrl);
                if (processedImageUrl) URL.revokeObjectURL(processedImageUrl);

                // Reset state
                setStep('select');
                setSelectedFile(null);
                setOriginalImageUrl('');
                setProcessedImageUrl('');
                setEditData(null);
                setUploadProgress(0);
                setUploadError('');
            }
            onOpenChange(newOpen);
        },
        [onOpenChange, originalImageUrl, processedImageUrl]
    );

    // Initialize based on mode
    const initializeModal = useCallback(() => {
        if (mode === 'edit' && user?.image) {
            setOriginalImageUrl(user.image);
            setStep('edit');
        } else {
            setStep('select');
        }
    }, [mode, user?.image]);

    // Handle file selection
    const handleFileSelect = useCallback((file: File, previewUrl: string) => {
        setSelectedFile(file);
        setOriginalImageUrl(previewUrl);
        setStep('edit');
    }, []);

    // Handle edit changes
    const handleEditChange = useCallback((newEditData: ImageEditData) => {
        setEditData(newEditData);
    }, []);

    // Handle processed image
    const handleProcessedImageChange = useCallback((url: string) => {
        setProcessedImageUrl(url);
    }, []);

    // Convert data URL to File
    const dataUrlToFile = async (dataUrl: string, fileName: string): Promise<File> => {
        const response = await fetch(dataUrl);
        const blob = await response.blob();
        return new File([blob], fileName, { type: blob.type });
    };

    // Upload image to S3
    const uploadImage = useCallback(async () => {
        if (!processedImageUrl) {
            toast.error('No processed image available');
            return;
        }

        try {
            setStep('uploading');
            setUploadProgress(0);
            setUploadError('');

            // Convert processed image to file
            const processedFile = await dataUrlToFile(processedImageUrl, 'profile-image.jpg');

            // Compute checksum
            const checksum = await computeSHA256(processedFile);

            // Generate unique key
            const timestamp = Date.now();
            const key = `profile-images/${user?.id}/${timestamp}-profile.jpg`;

            // Get signed URL
            const signedUrlResponse = await createSignedUrlMutation.mutateAsync({
                json: {
                    fileType: processedFile.type,
                    fileSize: processedFile.size,
                    checksum,
                    key,
                },
            });

            // Upload to S3 with progress tracking
            let currentProgress = 0;
            const progressInterval = setInterval(() => {
                currentProgress += Math.random() * 15 + 5; // 5-20% increments
                const progress = Math.min(currentProgress, 90);
                setUploadProgress(progress);
            }, 300);

            const uploadResult = await uploadFileToS3WithSignedUrl({
                url: signedUrlResponse.url,
                file: processedFile,
            });

            if (!uploadResult?.file?.url) {
                throw new Error('Failed to upload image');
            }

            clearInterval(progressInterval);
            setUploadProgress(100);

            // todo: update user profile image
            updateUserMutation.mutate(
                {
                    json: {
                        image: uploadResult?.file?.url,
                    },
                },
                {
                    onSuccess: () => {
                        toast.success('Profile image updated successfully!');
                        refetchSession();
                    },
                    onError: (error) => {
                        console.error('Failed to update user profile image:', error);
                        toast.error('Failed to update profile image. Please try again.');
                    },
                }
            );

            setStep('complete');
            toast.success('Profile image updated successfully!');
        } catch (error) {
            console.error('Upload failed:', error);
            setUploadError(error instanceof Error ? error.message : 'Upload failed');
            setStep('edit');
            toast.error('Failed to upload image. Please try again.');
        }
    }, [processedImageUrl, user?.id, createSignedUrlMutation]);

    // Get modal title
    const getTitle = () => {
        switch (step) {
            case 'select':
                return mode === 'upload' ? 'Upload Profile Image' : 'Edit Profile Image';
            case 'edit':
                return 'Edit Your Image';
            case 'uploading':
                return 'Uploading Image';
            case 'complete':
                return 'Upload Complete';
            default:
                return 'Profile Image';
        }
    };

    // Get modal content
    const getContent = () => {
        switch (step) {
            case 'select':
                return <FileDropzone onFileSelect={handleFileSelect} />;

            case 'edit':
                return (
                    <ImageEditor
                        src={originalImageUrl}
                        onEditChange={handleEditChange}
                        onProcessedImageChange={handleProcessedImageChange}
                    />
                );

            case 'uploading':
                return (
                    <UploadProgress
                        progress={uploadProgress}
                        status="uploading"
                        fileName={selectedFile?.name || 'profile-image.jpg'}
                    />
                );

            case 'complete':
                return (
                    <UploadProgress
                        progress={100}
                        status="success"
                        fileName={selectedFile?.name || 'profile-image.jpg'}
                    />
                );

            default:
                return null;
        }
    };

    // Get footer actions
    const getFooterActions = () => {
        switch (step) {
            case 'select':
                return (
                    <Button variant="outline" onClick={() => handleOpenChange(false)}>
                        Cancel
                    </Button>
                );

            case 'edit':
                return (
                    <>
                        <Button
                            variant="outline"
                            onClick={() =>
                                mode === 'upload' ? setStep('select') : handleOpenChange(false)
                            }
                        >
                            <IconArrowLeft className="w-4 h-4 mr-2" />
                            {mode === 'upload' ? 'Back' : 'Cancel'}
                        </Button>
                        <Button
                            onClick={uploadImage}
                            disabled={!processedImageUrl || createSignedUrlMutation.isPending}
                        >
                            Save Image
                        </Button>
                    </>
                );

            case 'uploading':
                return null; // No actions during upload

            case 'complete':
                return (
                    <Button onClick={() => handleOpenChange(false)}>
                        <IconCheck className="w-4 h-4 mr-2" />
                        Done
                    </Button>
                );

            default:
                return null;
        }
    };

    // Initialize when modal opens
    if (open && step === 'select' && mode === 'edit') {
        initializeModal();
    }

    return (
        <ResponsiveModal open={open} onOpenChange={handleOpenChange}>
            <DialogHeader>
                <DialogTitle>{getTitle()}</DialogTitle>
            </DialogHeader>

            <div className="py-4">{getContent()}</div>

            <Separator />

            <DialogFooter className="flex gap-2">{getFooterActions()}</DialogFooter>
        </ResponsiveModal>
    );
}
