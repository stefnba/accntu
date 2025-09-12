import { getNavItem, userNavItems } from '@/app/(protected)/user/utils';
import { MainContent } from '@/components/layout/main';
import { SessionManager } from '@/features/user/components/security/session-manager';

const item = getNavItem(userNavItems, '/user/security');

export default function SecurityPage() {
    return (
        <MainContent
            pageHeader={{
                title: item.title,
                description: item.description,
            }}
            backButton
        >
            <SessionManager />
        </MainContent>
    );
}
