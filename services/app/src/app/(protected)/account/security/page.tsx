import { PageHeader } from '@/components/page/header';
import { Separator } from '@/components/ui/separator';
import { ActiveSessionsSection } from '@/features/user/components/update-security/active-sessions-section';
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
                subTitle="Secure your account and view active sessions"
            />
            <div className="max-w-2xl">
                <Separator />
                <ChangePasswordSection />
                <Separator />
                <MultiFactorAuthSection />
                <Separator />
                <ActiveSessionsSection />
                <Separator />
            </div>
        </>
    );
};

export default SecurityPage;
