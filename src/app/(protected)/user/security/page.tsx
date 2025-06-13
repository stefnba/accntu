import { getNavItem, userNavItems } from '@/app/(protected)/user/page';
import { PageHeader } from '@/components/page-header';
import { ListActiveSessions } from '@/features/user/components/security/list-sessions';
import { RevokeAllSessionsButton } from '@/features/user/components/security/revoke-all-sessions-button';

const item = getNavItem(userNavItems, '/user/security');

export default function SecurityPage() {
    return (
        <div>
            <PageHeader
                title={item.title}
                description={item.description}
                actionBar={<>{<RevokeAllSessionsButton />}</>}
            />
            <ListActiveSessions />
        </div>
    );
}
