'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useSessionUser } from '@features/auth/hooks/session';

export const NavbarUserImage = () => {
    const { user } = useSessionUser();
    return (
        <Avatar className="size-9">
            <AvatarImage src={user?.image || undefined} alt="User" />
            <AvatarFallback>User</AvatarFallback>
        </Avatar>
    );
};
