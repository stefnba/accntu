import { PageHeader } from '@/components/page/header';
import { UpdateEmailSection } from '@/features/user/components/update-profile/update-email';
import { UpdateUserImageSection } from '@/features/user/components/update-profile/update-image';
import { UpdateNameSection } from '@/features/user/components/update-profile/update-name';
import { getUser } from '@/lib/auth';

const ProfilePage = async () => {
    const user = await getUser();

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

            <UpdateUserImageSection />

            <div className="max-w-4xl">
                <UpdateNameSection
                    firstName={user.firstName}
                    lastName={user.lastName}
                />
                <UpdateEmailSection email={user.email || ''} />
            </div>
        </>
    );
};

export default ProfilePage;
