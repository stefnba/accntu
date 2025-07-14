'use client';

import { ResponsiveModal } from '@/components/ui/responsive-modal';
import { UserProfileForm } from '@/features/user/components/profile/forms/user-profile-form';
import { ProfileImageModal } from '@/features/user/components/profile/profile-image-modal';
import { useProfileUpdateModal } from '@/features/user/hooks';

export const ProfileUpdateModal = () => {
    const { isModalOpen, modalView, closeModal } = useProfileUpdateModal();

    const title = {
        name: 'Update Name',
        email: 'Update Email',
        picture: 'Update Picture',
    } as const;

    const description = {
        name: undefined,
        email: undefined,
        picture: undefined,
    } as const;

    return (
        <ResponsiveModal
            size="auto"
            open={isModalOpen}
            onOpenChange={closeModal}
            title={title[modalView || 'name']}
            description={description[modalView || 'name']}
        >
            {modalView === 'name' && <UserProfileForm />}
            {modalView === 'picture' && <ProfileImageModal />}
        </ResponsiveModal>
    );
};
