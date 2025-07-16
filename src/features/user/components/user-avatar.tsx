'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserAvatarSize, userAvatarSizes } from '@/features/user/schemas';
import { generateUserInitials } from '@/features/user/utils';
import { cn } from '@/lib/utils';

interface UserAvatarProps {
    user: {
        name?: string | null;
        lastName?: string | null;
        email: string;
        image?: string | null;
    };
    size?: UserAvatarSize;
    className?: string;
    showBorder?: boolean;
    onClick?: () => void;
}

export const UserAvatar = ({
    user,
    size = 'md',
    className,
    showBorder = false,

    onClick,
}: UserAvatarProps) => {
    const initials = generateUserInitials(user);
    const sizeClasses = userAvatarSizes[size];

    return (
        <Avatar
            className={cn(
                sizeClasses,
                showBorder && 'ring-2 ring-border ring-offset-2 ring-offset-background',
                onClick && 'cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all',
                className
            )}
            onClick={onClick}
        >
            <AvatarImage
                src={user.image || undefined}
                alt={`${user.name || user.email} avatar`}
                className="object-cover"
            />
            <AvatarFallback
                className={cn(
                    'bg-gradient-to-br from-primary/10 to-primary/20 text-primary font-medium',
                    'select-none'
                )}
            >
                {initials}
            </AvatarFallback>
        </Avatar>
    );
};
