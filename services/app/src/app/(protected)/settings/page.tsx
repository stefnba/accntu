import { PageHeader } from '@/components/page/header';
import {
    CardDescription,
    CardHeader,
    CardIcon,
    CardTitle,
    NavCard
} from '@/components/ui/card';
import { IconType } from 'react-icons';
import { BiLabel } from 'react-icons/bi';
import { BsBank } from 'react-icons/bs';
import { CgHashtag } from 'react-icons/cg';

type TNavItem = {
    title: string;
    href: string;
    description?: string;
    avatar?: IconType;
};

const navItems: TNavItem[] = [
    {
        title: 'Bank Accounts',
        href: '/settings/account',
        description: 'View, edit and create transaction accounts.',
        avatar: BsBank
    },
    {
        title: 'Labels',
        href: '/settings/label',
        description: 'Manage labels to categorize your transactions.',
        avatar: BiLabel
    },
    {
        title: 'Tags',
        href: '/settings/tag',
        description: 'Tags your transactions for more detailed categorization.',
        avatar: CgHashtag
    }
];

export default async function LabelListPage() {
    return (
        <div>
            <PageHeader title="Settings" />

            <div className="mb-4 grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {navItems.map(({ description, href, title, avatar }) => (
                    <NavCard
                        key={href}
                        href={href}
                        className="hover:scale-[1.01]"
                    >
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
        </div>
    );
}
