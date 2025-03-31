import { getNavItem, userNavItems } from '@/app/(protected)/user/page';
import { PageHeader } from '@/components/page-header';
import { ActiveSessions } from '@/features/auth/components/active-sessions';
import { RevokeAllSessionsButton } from '@/features/auth/components/revoke-all-sessions-button';

const item = getNavItem(userNavItems, '/user/security');

export default function SecurityPage() {
    return (
        <div>
            <PageHeader
                title={item.title}
                description={item.description}
                actionBar={<>{<RevokeAllSessionsButton />}</>}
            />
            <ActiveSessions />
        </div>
    );
}
