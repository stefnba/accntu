'use client';

import { storeUpdateUserNameCollapsible } from '@/features/user/store/update-user-name-collapsible';

import { AccountCollapsibleSection } from '../update-section';
import { UpdateNameForm } from './update-name-form';

interface Props {
    firstName: string | null;
    lastName: string | null;
}

export const UpdateNameSection: React.FC<Props> = ({ firstName, lastName }) => {
    const { isOpen, handleOpenChange } = storeUpdateUserNameCollapsible();

    const name = `${firstName} ${lastName}`;

    return (
        <AccountCollapsibleSection
            isOpen={isOpen}
            onOpenChange={handleOpenChange}
            title="Name"
            subTitle={name || ''}
            content={
                <UpdateNameForm firstName={firstName} lastName={lastName} />
            }
        />
    );
};
