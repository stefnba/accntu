import { PageHeader } from '@/components/page/header';
import { StatsCard } from '@/components/ui/stats';
import { getUser } from '@server/auth/next/authenticate';

export default async function Home() {
    const user = await getUser();

    return (
        <>
            <PageHeader title="Home" />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard></StatsCard>
                <StatsCard></StatsCard>
                <StatsCard></StatsCard>
                <StatsCard></StatsCard>
            </div>
        </>
    );
}
