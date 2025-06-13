import { getNavItem, userNavItems } from '@/app/(protected)/user/page';
import { PageHeader } from '@/components/page-header';
import { Separator } from '@/components/ui/separator';
import { UserProfileForm } from '@/features/user/components/profile/forms/user-profile-form';
import { ProfileImageUpload } from '@/features/user/components/profile/profile-image-upload';

const item = getNavItem(userNavItems, '/user/profile');

export default function ProfilePage() {
    return (
        <div>
            <PageHeader title={item.title} description={item.description} />

            <div className="space-y-12">
                <ProfileImageUpload />
                <Separator className="my-6" />
                <UserProfileForm />
            </div>
        </div>
    );
}
