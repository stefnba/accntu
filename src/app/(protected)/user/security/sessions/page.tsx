import { getNavItem, userNavItems } from '@/app/(protected)/user/utils';
import { MainContent } from '@/components/layout/main';
import { ListActiveSessions } from '@/features/user/components/security/list-sessions';
import { RevokeAllSessionsButton } from '@/features/user/components/security/revoke-all-sessions-button';

const item = getNavItem(userNavItems, '/user/security');

export default function SecurityPage() {
    return (
        <MainContent
            pageHeader={{
                title: item.title,
                description: item.description,
                actionBar: <RevokeAllSessionsButton />,
            }}
            backButton
        >
            <ListActiveSessions />
        </MainContent>
    );
}
