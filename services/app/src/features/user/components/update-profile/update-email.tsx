'use client';

import { AccountCollapsibleSection } from '../update-section';

interface Props {
    email: string;
}

export const UpdateEmailSection: React.FC<Props> = ({ email }) => {
    return (
        <AccountCollapsibleSection
            title="Email"
            subTitle={email}
            content={<div>Coming soon...</div>}
        />
    );
};
