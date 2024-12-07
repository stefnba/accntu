'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useSession } from '@features/auth/hooks/session';

export const NavbarUserImage = () => {
    const { user } = useSession();
    return (
        <Avatar className="size-9">
            <AvatarImage src={user?.image || undefined} alt="User" />
            <AvatarFallback>User</AvatarFallback>
        </Avatar>
    );
};
