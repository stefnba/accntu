'use client';

import { Button } from '@/components/ui/button';
import { storeUpdateUserImageModal } from '@/features/user/store/update-user-image-modal';

interface Props {}

export const UpdateUserImageTrigger: React.FC<Props> = ({}) => {
    const { handleOpen } = storeUpdateUserImageModal();
    return (
        <Button className="mt-2" onClick={handleOpen} variant="outline">
            Update
        </Button>
    );
};
