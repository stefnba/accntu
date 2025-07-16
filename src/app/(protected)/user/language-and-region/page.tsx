import { getNavItem, userNavItems } from '@/app/(protected)/user/page';
import { MainContent } from '@/components/layout/main';
import { LanguageAndRegionForm } from '@/features/user/components/language-and-region/language-and-region';

const item = getNavItem(userNavItems, '/user/language-and-region');

export default function LanguageAndRegionPage() {
    return (
        <MainContent
            pageHeader={{
                title: item.title,
                description: item.description,
            }}
            backButton
        >
            <LanguageAndRegionForm />
        </MainContent>
    );
}
