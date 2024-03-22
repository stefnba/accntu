import { PageHeader } from '@/components/page/header';

const NotificationPage = () => {
    return (
        <>
            <PageHeader
                title="Notification"
                breadcrumbs={[
                    {
                        href: '/account',
                        page: 'Account'
                    },
                    {
                        href: 'profile',
                        page: 'Notification'
                    }
                ]}
                subTitle="Manage your account settings"
            />
        </>
    );
};

export default NotificationPage;
