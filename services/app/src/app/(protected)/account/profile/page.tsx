import { PageHeader } from '@/components/page/header';
import { Separator } from '@/components/ui/separator';
import { getUser } from '@auth/next';
import { UpdateEmailSection } from '@features/user/components/update-profile/email/section';
import { UpdateNameSection } from '@features/user/components/update-profile/name/section';
import { UpdateUserImageSection } from '@features/user/components/update-profile/picture/profile-picture';

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

            <div className="max-w-2xl">
                <UpdateUserImageSection />
                <Separator />
                <UpdateNameSection
                    firstName={user.firstName}
                    lastName={user.lastName}
                />
                <Separator />
                <UpdateEmailSection email={user.email || ''} />
                <Separator />
            </div>
        </>
    );
};

export default ProfilePage;
