import { PageHeader } from '@/components/page/header';
import { ChangePasswordSection } from '@/features/user/components/update-security/change-password-section';
import { MultiFactorAuthSection } from '@/features/user/components/update-security/mfa-section';

const SecurityPage = () => {
    return (
        <>
            <PageHeader
                title="Security"
                breadcrumbs={[
                    {
                        href: '/account',
                        page: 'Account'
                    },
                    {
                        href: '/account/security',
                        page: 'Security'
                    }
                ]}
                subTitle="Manage your account settings"
            />
            <div className="max-w-6xl">
                <ChangePasswordSection />
                <MultiFactorAuthSection />
            </div>
        </>
    );
};

export default SecurityPage;
