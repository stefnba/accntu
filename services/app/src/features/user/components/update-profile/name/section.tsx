'use client';

import { Button } from '@/components/ui/button';
import { AccountCustomSection } from '@features/user/components/update-section';
import { useUserUpdateModal } from '@features/user/hooks/user-update-modal';

interface Props {
    firstName: string | null;
    lastName: string | null;
}

export const UpdateNameSection: React.FC<Props> = ({ firstName, lastName }) => {
    const { handleOpen } = useUserUpdateModal();

    const name = `${firstName} ${lastName}`;

    return (
        <AccountCustomSection
            title="Name"
            subTitle={name || ''}
            action={
                <Button variant="ghost" onClick={() => handleOpen('name')}>
                    Update
                </Button>
            }
        />
    );
};
