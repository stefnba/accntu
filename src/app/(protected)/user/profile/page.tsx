import { getNavItem, userNavItems } from '@/app/(protected)/user/page';
import { MainContent } from '@/components/layout/main';
import { CurrentUserProfile } from '@/features/user/components/profile/current-profile';
import { UserProfileForm } from '@/features/user/components/profile/forms/user-profile-form';
import { ProfileImageUpload } from '@/features/user/components/profile/profile-image-upload';

const item = getNavItem(userNavItems, '/user/profile');

export default function ProfilePage() {
    return (
        <MainContent
            backButton={true}
            pageHeader={{
                title: item.title,
                description: item.description,
            }}
        >
            {/* <UserManager /> */}

            <div className="space-y-10">
                <CurrentUserProfile />
                <UserProfileForm />
                <ProfileImageUpload />
            </div>
        </MainContent>
    );
}
