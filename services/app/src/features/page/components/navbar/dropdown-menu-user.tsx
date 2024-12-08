'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useSessionUser } from '@features/auth/hooks/session';

export const DropdownMenuUser = () => {
    const { user } = useSessionUser();

    return (
        <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
            <Avatar className="h-8 w-8 rounded-full">
                <AvatarImage src={user?.image || undefined} alt={user?.email} />
                <AvatarFallback className="rounded-lg">CN</AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left leading-tight ">
                <span className="truncate text font-semibold">
                    {user?.firstName} {user?.lastName}
                </span>
                <span className="text-xs truncate text-muted-foreground">
                    {user?.email}
                </span>
            </div>
        </div>
    );
};
