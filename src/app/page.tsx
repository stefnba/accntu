import { ThemeToggle } from '@/components/layout/theme-selector';
import { Button } from '@/components/ui/button';

import { db } from '@/server/db';

export default async function Home() {
    const users = await db.query.user.findMany();

    console.log(users);

    return (
        <div className="">
            <ThemeToggle />
            <Button>Click me</Button>
        </div>
    );
}
