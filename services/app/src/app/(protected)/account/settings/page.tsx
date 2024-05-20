import { PageHeader } from '@/components/page/header';
import { SettingsLanguageSection } from '@/features/user/components/update-settings/update-language';
import { SettingsTimezoneSection } from '@/features/user/components/update-settings/update-timezone';

const SettingsPage = () => {
    return (
        <>
            <PageHeader
                title="Settings"
                breadcrumbs={[
                    {
                        href: '/account',
                        page: 'Account'
                    },
                    {
                        href: 'settings',
                        page: 'Settings'
                    }
                ]}
                subTitle="Set your default language and timezone"
            />
            <div className="max-w-6xl">
                <SettingsLanguageSection />
                <SettingsTimezoneSection />
            </div>
        </>
    );
};

export default SettingsPage;
