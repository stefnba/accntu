'use client';

import { Button } from '@/components/ui/button';
import { useSessionUser } from '@features/auth/hooks/session';
import { AccountCustomSection } from '@features/user/components/update-section';
import { useUserUpdateModal } from '@features/user/hooks/user-update-modal';

interface Props {}

export const UpdateNameSection: React.FC<Props> = () => {
    const { handleOpen } = useUserUpdateModal();

    const { user } = useSessionUser();

    return (
        <AccountCustomSection
            title="Name"
            subTitle={user ? `${user?.firstName} ${user?.lastName}` : ''}
            action={
                <Button variant="ghost" onClick={() => handleOpen('name')}>
                    Update
                </Button>
            }
        />
    );
};
