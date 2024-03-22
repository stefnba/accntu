import { getUser } from '@/lib/auth';

import { AccountSection } from '../../../_components/section';

const EmailSection = async () => {
    const user = await getUser();

    return (
        <>
            <AccountSection title="Email" subTitle={user.email || undefined} />
        </>
    );
};

export default EmailSection;
