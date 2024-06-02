import { PageHeader } from '@/components/page/header';
import { getUser } from '@server/auth/next/authenticate';

export default async function Home() {
    const user = await getUser();

    return (
        <div>
            <PageHeader title="Home" />
            Hi {user.email}
            {JSON.stringify(user, null, 4)}
        </div>
    );
}
