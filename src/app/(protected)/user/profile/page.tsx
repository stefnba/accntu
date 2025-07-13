import { getNavItem, userNavItems } from '@/app/(protected)/user/page';
import { MainContent } from '@/components/layout/main';
import { UserProfileForm } from '@/features/user/components/profile/forms/user-profile-form';

const item = getNavItem(userNavItems, '/user/profile');

export default function ProfilePage() {
    return (
        <MainContent
            backButton={true}
            // pageHeader={{
            //     title: item.title,
            //     description: item.description,
            // }}
        >
            {/* <UserManager /> */}

            <div className="space-y-12">
                {/* <ProfileImageUpload /> */}
                {/* <Separator className="my-6" /> */}
                <UserProfileForm />
            </div>
        </MainContent>
    );
}
