import { Appearance, Notification, Security, User } from '@/components/icons';
import { MainContent } from '@/components/layout/main';
import { NavCard } from '@/components/nav-card';
import { CardDescription, CardHeader, CardIcon, CardTitle } from '@/components/ui/card';
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

export default async function UserPage() {
    return (
        <MainContent
            pageHeader={{
                title: 'Account Center',
                description: 'Manage your account & settings',
            }}
        >
            <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {userNavItems.map(({ description, href, title, avatar }) => (
                    <NavCard key={href} href={href} className="hover:scale-[1.01]">
                        <CardHeader>
                            {avatar && <CardIcon icon={avatar} />}
                            <CardTitle>{title}</CardTitle>
                            <CardDescription className="h-[40px]">{description}</CardDescription>
                        </CardHeader>
                    </NavCard>
                ))}
            </div>
        </MainContent>
    );
}
