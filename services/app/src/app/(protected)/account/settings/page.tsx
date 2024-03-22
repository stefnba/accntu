import { PageHeader } from '@/components/page/header';
import LanguageSection from './_components/language-section';
import TimezoneSection from './_components/timezone-section';

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
                <LanguageSection />
                <TimezoneSection />
            </div>
        </>
    );
};

export default SettingsPage;
