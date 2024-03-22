import { PageHeader } from '@/components/page/header';
import {
    CardDescription,
    CardHeader,
    CardIcon,
    CardTitle,
    NavCard
} from '@/components/ui/card';
import { Bell, Lock, LucideIcon, Settings, Sun, User2 } from 'lucide-react';

type TNavItem = {
    title: string;
    href: string;
    description?: string;
    avatar?: LucideIcon;
};

const navItems: TNavItem[] = [
    {
        title: 'Profile',
        href: 'account/profile',
        description: 'Provide personal details and how we can reach you',
        avatar: User2
    },
    {
        title: 'Security',
        href: 'account/security',
        description: 'Secure your account and view active sessions',
        avatar: Lock
    },
    {
        title: 'Notification',
        href: 'account/notification',
        description:
            'Choose notification preferences and how you want to be contacted',
        avatar: Bell
    },
    {
        title: 'Apparence',
        href: 'account/apparance',
        description:
            'Customize the appearance of the app - switch between day and night themes.',
        avatar: Sun
    },
    {
        title: 'Settings',
        href: 'account/settings',
        description: 'Set your default language and timezone',
        avatar: Settings
    }
];

const SettingsPage = async () => {
    return (
        <>
            <PageHeader
                title="Account"
                subTitle="Manage your account & settings"
            />

            <div className="mb-4 grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {navItems.map(({ description, href, title, avatar }) => (
                    <NavCard key={href} href={href} className="">
                        <CardHeader>
                            {avatar && <CardIcon icon={avatar} />}
                            <CardTitle>{title}</CardTitle>
                            <CardDescription className="h-[40px]">
                                {description}
                            </CardDescription>
                        </CardHeader>
                    </NavCard>
                ))}
            </div>
        </>
    );
};

export default SettingsPage;
