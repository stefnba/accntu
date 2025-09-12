import { userNavItems } from '@/app/(protected)/user/utils';
import { MainContent } from '@/components/layout/main';
import { NavCard } from '@/components/nav-card';
import { CardDescription, CardHeader, CardIcon, CardTitle } from '@/components/ui/card';

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
