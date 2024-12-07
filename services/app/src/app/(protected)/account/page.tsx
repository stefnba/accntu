import { PageHeader } from '@/components/page/header';
import {
    CardDescription,
    CardHeader,
    CardIcon,
    CardTitle,
    NavCard
} from '@/components/ui/card';
import { type IconType } from 'react-icons';
import { LuBell, LuLock, LuSettings, LuSun, LuUser2 } from 'react-icons/lu';

type TNavItem = {
    title: string;
    href: string;
    description?: string;
    avatar?: IconType;
};

const navItems: TNavItem[] = [
    {
        title: 'Profile',
        href: 'account/profile',
        description: 'Provide personal details and how we can reach you',
        avatar: LuUser2
    },
    {
        title: 'Security',
        href: 'account/security',
        description: 'Secure your account and view active sessions',
        avatar: LuLock
    },
    {
        title: 'Notification',
        href: 'account/notification',
        description:
            'Choose notification preferences and how you want to be contacted',
        avatar: LuBell
    },
    {
        title: 'Appearance',
        href: 'account/appearance',
        description:
            'Customize the appearance of the app - switch between day and night themes.',
        avatar: LuSun
    },
    {
        title: 'Settings',
        href: 'account/settings',
        description: 'Set your default language and timezone',
        avatar: LuSettings
    }
];

const SettingsPage = async () => {
    return (
        <>
            <PageHeader
                title="Account"
                subTitle="Manage your account & settings"
            />

            <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
