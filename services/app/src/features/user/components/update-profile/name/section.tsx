'use client';

import { Button } from '@/components/ui/button';
import { useGetUser } from '@/features/user/api/get-user';
import { AccountCustomSection } from '@features/user/components/update-section';
import { useUserUpdateModal } from '@features/user/hooks/user-update-modal';
import { useSession } from '@hooks/session';

interface Props {}

export const UpdateNameSection: React.FC<Props> = () => {
    const { handleOpen } = useUserUpdateModal();

    const { data: user } = useGetUser();

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
