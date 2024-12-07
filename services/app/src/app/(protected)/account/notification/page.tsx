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
                subTitle="Choose notification preferences and how you want to be contacted"
            />
        </>
    );
};

export default NotificationPage;
