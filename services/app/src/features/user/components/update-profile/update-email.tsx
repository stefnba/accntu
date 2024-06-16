'use client';

import { AccountCustomSection } from '../update-section';

interface Props {
    email: string;
}

export const UpdateEmailSection: React.FC<Props> = ({ email }) => {
    return <AccountCustomSection title="Email" subTitle={email} />;
};
