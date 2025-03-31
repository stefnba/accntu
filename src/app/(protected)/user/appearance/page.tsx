import { getNavItem, userNavItems } from '@/app/(protected)/user/page';
import { PageHeader } from '@/components/page-header';
import { AppearanceForm } from '@/features/user/components/forms/appearance-form';

const item = getNavItem(userNavItems, '/user/appearance');

export default function Page() {
    return (
        <div>
            <PageHeader title={item.title} description={item.description} />
            <AppearanceForm />
        </div>
    );
}
