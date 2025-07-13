import { getNavItem, userNavItems } from '@/app/(protected)/user/page';
import { MainContent } from '@/components/layout/main';

const item = getNavItem(userNavItems, '/user/notification');

export default function NotificationPage() {
    return (
        <MainContent
            pageHeader={{
                title: item.title,
                description: item.description,
            }}
            backButton
        >
            Notification
        </MainContent>
    );
}
