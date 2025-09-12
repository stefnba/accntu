import { getNavItem, userNavItems } from '@/app/(protected)/user/utils';
import { MainContent } from '@/components/layout/main';
import { CurrentUserProfile } from '@/features/user/components/profile/current-profile';
import { ProfileCard } from '@/features/user/components/profile/profile-card';
import { ProfileUpdateModal } from '@/features/user/components/profile/profile-update-modal';

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
            <div className="space-y-8">
                <CurrentUserProfile />
                <ProfileCard />
            </div>
            <ProfileUpdateModal />
        </MainContent>
    );
}
