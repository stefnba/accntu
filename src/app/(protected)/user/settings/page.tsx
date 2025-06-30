import { getNavItem, userNavItems } from '@/app/(protected)/user/page';
import { PageHeader } from '@/components/page-header';

const item = getNavItem(userNavItems, '/user/settings');

export default function SettingsPage() {
    return (
        <div>
            <PageHeader title={item.title} description={item.description} />
            Settings
        </div>
    );
}
