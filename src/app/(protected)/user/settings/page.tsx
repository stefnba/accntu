import { getNavItem, userNavItems } from '@/app/(protected)/user/page';
import { MainContent } from '@/components/layout/main';

const item = getNavItem(userNavItems, '/user/settings');

export default function SettingsPage() {
    return (
        <MainContent
            pageHeader={{
                title: item.title,
                description: item.description,
            }}
            backButton
        >
            Settings
        </MainContent>
    );
}
