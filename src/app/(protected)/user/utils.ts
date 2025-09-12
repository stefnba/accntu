import { Appearance, Notification, Security, User } from '@/components/icons';
import { RoutePath } from '@/lib/routes';
import { Globe } from 'lucide-react';
import { IconType } from 'react-icons';

type TNavItem = {
    title: string;
    href: RoutePath;
    description?: string;
    avatar?: IconType;
};

export function getNavItem<T extends TNavItem>(items: T[], filter: T['href']): T {
    return items.filter((i) => i.href === filter)[0];
}

export const userNavItems: TNavItem[] = [
    {
        title: 'Profile',
        href: '/user/profile',
        description: 'Update your personal information and profile details',
        avatar: User,
    },
    {
        title: 'Security',
        href: '/user/security',
        description: 'Secure your account and view active sessions',
        avatar: Security,
    },
    {
        title: 'Notifications',
        href: '/user/notifications',
        description: 'Choose notification preferences and how you want to be contacted',
        avatar: Notification,
    },
    {
        title: 'Appearance',
        href: '/user/appearance',
        description: 'Customize the appearance of the app - switch between day and night themes.',
        avatar: Appearance,
    },
    {
        title: 'Language & Region',
        href: '/user/language-and-region',
        description: 'Set your default language, date format and timezone',
        avatar: Globe,
    },
];