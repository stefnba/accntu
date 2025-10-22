'use client';

import { ResponsiveModal } from '@/components/responsive-modal';
import { Button } from '@/components/ui/button';
import { useUserEndpoints } from '@/features/user/api';
import { ProfilePictureUpdateFileDropzone } from '@/features/user/components/profile/image-editor/file-dropzone';
import { ImageEditor } from '@/features/user/components/profile/image-editor/image-editor';
import { UploadProgress } from '@/features/user/components/profile/image-editor/upload-progress';
import { useProfilePictureUpdateModal } from '@/features/user/hooks/profile';
import { useAuth, useAuthEndpoints } from '@/lib/auth/client';
import { uploadFileToS3WithSignedUrl } from '@/lib/upload/cloud/s3/services';
import { computeSHA256 } from '@/lib/upload/utils';
import { useCallback, useState } from 'react';
import toast from 'react-hot-toast';

export const ProfilePictureUpdateModal = () => {
    const modal = useProfilePictureUpdateModal();
    const { user, refetchSession } = useAuth();

    // State
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [originalImageUrl, setOriginalImageUrl] = useState<string>('');
    const [processedImageUrl, setProcessedImageUrl] = useState<string>('');
    const [uploadProgress, setUploadProgress] = useState(0);

    // API hooks
    const createSignedUrlMutation = useUserEndpoints.createS3SignedUrl();
    const updateUserMutation = useAuthEndpoints.updateUser();

    // Reset modal state when closed
    const reset = useCallback(() => {
        if (originalImageUrl) URL.revokeObjectURL(originalImageUrl);
        if (processedImageUrl) URL.revokeObjectURL(processedImageUrl);

        setSelectedFile(null);
        setOriginalImageUrl('');
        setProcessedImageUrl('');
        setUploadProgress(0);
        modal.resetView();
    }, [originalImageUrl, processedImageUrl, modal]);

    // Handle file selection
    const handleFileSelect = useCallback(
        (file: File, previewUrl: string) => {
            setSelectedFile(file);
            setOriginalImageUrl(previewUrl);
            modal.setView('edit');
        },
        [modal]
    );

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
            modal.setView('uploading');
            setUploadProgress(0);

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
                currentProgress += Math.random() * 15 + 5;
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

            // Update user profile image
            await updateUserMutation.mutateAsync({
                image: uploadResult.file.url,
            });

            refetchSession();
            modal.setView('complete');
            toast.success('Profile image updated successfully!');
        } catch (error) {
            console.error('Upload failed:', error);
            modal.setView('edit');
            toast.error('Failed to upload image. Please try again.');
        }
    }, [
        processedImageUrl,
        user?.id,
        createSignedUrlMutation,
        updateUserMutation,
        refetchSession,
        modal,
    ]);

    const handleClose = () => {
        reset();
        modal.close();
    };

    return (
        <ResponsiveModal size="xl" open={modal.isOpen} onOpenChange={handleClose}>
            {/* Select view */}
            <modal.View name="select">
                <ResponsiveModal.Header>
                    <ResponsiveModal.Title>Select Profile Image</ResponsiveModal.Title>
                    <ResponsiveModal.Description>
                        Choose an image to upload as your profile picture
                    </ResponsiveModal.Description>
                </ResponsiveModal.Header>
                <ResponsiveModal.Content>
                    <ProfilePictureUpdateFileDropzone onFileSelect={handleFileSelect} />
                </ResponsiveModal.Content>
            </modal.View>

            {/* Edit view */}
            <modal.View name="edit">
                <ResponsiveModal.Header>
                    <ResponsiveModal.Title>Edit Profile Image</ResponsiveModal.Title>
                    <ResponsiveModal.Description>
                        You can drag to reposition, scroll or pinch to zoom, and use controls below
                        for more options
                    </ResponsiveModal.Description>
                </ResponsiveModal.Header>
                <ResponsiveModal.Content>
                    <ImageEditor
                        src={originalImageUrl}
                        onEditChange={() => {}}
                        onProcessedImageChange={handleProcessedImageChange}
                    />
                </ResponsiveModal.Content>
                <ResponsiveModal.Footer>
                    <Button type="button" variant="outline" onClick={() => modal.setView('select')}>
                        Back
                    </Button>
                    <Button
                        type="button"
                        onClick={uploadImage}
                        disabled={!processedImageUrl || uploadProgress > 0}
                    >
                        Upload Image
                    </Button>
                </ResponsiveModal.Footer>
            </modal.View>

            {/* Uploading view */}
            <modal.View name="uploading">
                <ResponsiveModal.Header>
                    <ResponsiveModal.Title>Uploading Image</ResponsiveModal.Title>
                </ResponsiveModal.Header>
                <ResponsiveModal.Content>
                    <UploadProgress
                        progress={uploadProgress}
                        status="uploading"
                        fileName={selectedFile?.name || 'profile-image.jpg'}
                    />
                </ResponsiveModal.Content>
            </modal.View>

            {/* Complete view */}
            <modal.View name="complete">
                <ResponsiveModal.Header>
                    <ResponsiveModal.Title>Upload Complete</ResponsiveModal.Title>
                </ResponsiveModal.Header>
                <ResponsiveModal.Content>
                    <UploadProgress
                        progress={100}
                        status="success"
                        fileName={selectedFile?.name || 'profile-image.jpg'}
                    />
                </ResponsiveModal.Content>
                <ResponsiveModal.Footer>
                    <Button type="button" onClick={handleClose}>
                        Done
                    </Button>
                </ResponsiveModal.Footer>
            </modal.View>
        </ResponsiveModal>
    );
};
