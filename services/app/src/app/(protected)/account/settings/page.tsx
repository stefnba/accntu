import { PageHeader } from '@/components/page/header';
import { Separator } from '@/components/ui/separator';
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
            <div className="max-w-2xl">
                <Separator />
                <SettingsLanguageSection />
                <Separator />
                <SettingsTimezoneSection />
                <Separator />
            </div>
        </>
    );
};

export default SettingsPage;
