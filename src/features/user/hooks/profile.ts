import { useResponsiveModal } from '@/components/responsive-modal/hooks';

/*
 * A hook to manage the profile name update modal.
 */
export const useProfileNameUpdateModal = () => {
    const modal = useResponsiveModal({
        key: 'profile-name',
    });

    return modal;
};

/**
 * A hook to manage the profile picture update modal.
 */
export const useProfilePictureUpdateModal = () => {
    const modal = useResponsiveModal({
        key: 'profile-picture',
        views: ['select', 'edit', 'uploading', 'complete'],
    });

    return modal;
};
