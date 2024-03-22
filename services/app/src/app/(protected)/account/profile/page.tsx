import { PageHeader } from '@/components/page/header';

import EmailSection from './_components/email/section';
import NameSection from './_components/name/section';
import PictureSection from './_components/picture/section';

const ProfilePage = async () => {
    return (
        <>
            <PageHeader
                title="Profile"
                breadcrumbs={[
                    {
                        href: '/account',
                        page: 'Account'
                    },
                    {
                        href: 'profile',
                        page: 'Profile'
                    }
                ]}
                subTitle="Provide personal details and how we can reach you"
            />

            <PictureSection />

            <div className="max-w-6xl">
                <NameSection />
                <EmailSection />
            </div>
        </>
    );
};

export default ProfilePage;
