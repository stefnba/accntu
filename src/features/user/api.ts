import { apiClient, createMutation } from '@/lib/api';

export const useUserEndpoints = {
    /**
     * Create a signed URL for uploading a profile image to S3
     */
    createS3SignedUrl: createMutation(apiClient.user['upload-profile-image']['signed-url'].$post),

    /**
     * Delete a file from S3
     */
    deleteS3File: createMutation(apiClient.user['upload-profile-image']['delete-file'].$delete),
};
