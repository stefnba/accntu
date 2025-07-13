'use client';

import { UserAvatar } from '@/features/user/components/user-avatar';
import { generateDisplayName } from '@/features/user/utils';
import { useAuth } from '@/lib/auth/client';
import { cn } from '@/lib/utils';

interface CurrentUserProfileProps {
    className?: string;
}

export const CurrentUserProfile: React.FC<CurrentUserProfileProps> = ({ className }) => {
    const { user } = useAuth();

    if (!user) {
        return null;
    }

    const displayName = generateDisplayName(user);

    return (
        <div className={cn('flex items-center gap-4 p-4 rounded-lg border bg-white', className)}>
            <UserAvatar user={user} size="lg" showBorder />
            <div>
                <h3 className="font-semibold">{displayName}</h3>
                <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
        </div>
    );
};
