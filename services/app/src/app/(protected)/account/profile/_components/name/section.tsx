import { AccountSection } from '@/app/(protected)/account/_components/section';
import { getUser } from '@/lib/auth';

import SectionModal from '../modal';
import ProfileUpdateForm from './form';

const NameSection = async () => {
    const user = await getUser();

    return (
        <>
            <AccountSection
                title="Name"
                subTitle={`${user.firstName || ''} ${user.lastName || ''}`}
                action={
                    <SectionModal
                        title="Update your name"
                        // description="Make changes to your First and Last Name here."
                        formComponent={ProfileUpdateForm}
                    />
                }
            />
        </>
    );
};

export default NameSection;
