import { getUser } from '@/auth';
import { PageHeader } from '@/components/page/header';

export default async function Home() {
    const user = await getUser();

    return (
        <div>
            <PageHeader title="Home" />
            Hi {user.email}
        </div>
    );
}
