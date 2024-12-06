import { ResponsiveModal } from '@/components/ui/responsive-modal';
import { useUserUpdateModal } from '@features/user/hooks/user-update-modal';

import { UpdateProfileNameModalContent } from './name/modal-content';
import { UpdateProfilePictureModalContent } from './picture/modal-content';

interface Props {}

export const UpdateUserModal: React.FC<Props> = ({}) => {
    const { isOpen, handleClose, type } = useUserUpdateModal();

    return (
        <ResponsiveModal open={isOpen} onOpenChange={handleClose}>
            {type === 'name' && (
                <UpdateProfileNameModalContent
                    firstName="dddd"
                    lastName="ddd"
                />
            )}

            {type === 'picture' && <UpdateProfilePictureModalContent />}
        </ResponsiveModal>
    );
};
