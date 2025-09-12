import { getNavItem, userNavItems } from '@/app/(protected)/user/utils';
import { MainContent } from '@/components/layout/main';
import { Card, CardContent } from '@/components/ui/card';
import { AppearanceForm } from '@/features/user/components/forms/appearance-form';

const item = getNavItem(userNavItems, '/user/appearance');

export default function Page() {
    return (
        <MainContent
            pageHeader={{
                title: item.title,
                description: item.description,
            }}
            backButton
        >
            <Card>
                <CardContent>
                    <AppearanceForm />
                </CardContent>
            </Card>
        </MainContent>
    );
}
