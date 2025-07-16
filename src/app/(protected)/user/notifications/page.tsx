import { getNavItem, userNavItems } from '@/app/(protected)/user/page';
import { MainContent } from '@/components/layout/main';
import { NotificationPreferencesForm } from '@/features/user/components/notifications/notification-preferences-form';

const item = getNavItem(userNavItems, '/user/notifications');

export default function NotificationsPage() {
    return (
        <MainContent
            pageHeader={{
                title: item.title,
                description: item.description,
            }}
            backButton
        >
            <NotificationPreferencesForm />
        </MainContent>
    );
}
