import { PageHeader } from '@/components/page/header';
import { FormItem, FormLabel } from '@/components/ui/form';
import { Select } from '@/components/ui/select';

import { AccountSection } from '../_components/section';
import ThemeSection from './_components/mode-section';
import { ThemeForm } from './_components/theme-form';

const ApparancePage = () => {
    return (
        <>
            <PageHeader
                title="Apparance"
                breadcrumbs={[
                    {
                        href: '/account',
                        page: 'Account'
                    },
                    {
                        href: 'profile',
                        page: 'Apparance'
                    }
                ]}
                subTitle="Customize the appearance of the app - switch between light and dark themes.    "
            />
            <div className="max-w-4xl flex space-x-4">
                {/* <ThemeSection /> */}
                <ThemeForm />
            </div>
        </>
    );
};

export default ApparancePage;
