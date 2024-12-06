import { AccountCustomSection } from '@features/user/components/update-section';
import { MdVerified } from 'react-icons/md';

interface Props {
    email: string;
}

export const UpdateEmailSection: React.FC<Props> = ({ email }) => {
    return (
        <AccountCustomSection
            title="Email"
            subTitle={email}
            action={
                <div className="flex gap-1 items-center">
                    <MdVerified className="" />
                    <span className="text-sm font-medium">Email verified</span>
                </div>
            }
        />
    );
};
