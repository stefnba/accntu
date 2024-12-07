import { PageHeader } from '@/components/page/header';
import { UpdateThemeForm } from '@/features/user/components/update-apparence/update-theme-form';

const AppearancePage = async () => {
    return (
        <>
            <PageHeader
                title="Appearance"
                breadcrumbs={[
                    {
                        href: '/account',
                        page: 'Account'
                    },
                    {
                        href: 'profile',
                        page: 'Appearance'
                    }
                ]}
                subTitle="Customize the appearance of the app - switch between light and dark themes.    "
            />
            <div className="max-w-4xl flex space-x-4">
                <UpdateThemeForm />
            </div>
        </>
    );
};

export default AppearancePage;
