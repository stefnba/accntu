import Link from 'next/link';

import { PageHeader } from '@/components/page/header';
import { Button } from '@/components/ui/button';
import db from '@/db';
import { getUser } from '@/lib/auth';

import { ImportCard } from './_components/import-card';

export default async function Import() {
    const user = await getUser();

    const imports = await db.import.findMany({
        where: {
            userId: user.id
        },
        include: {
            files: {
                select: {
                    filename: true,
                    id: true,
                    url: true
                }
            }
        }
    });

    return (
        <div>
            <PageHeader title="Imports" />
            <Button asChild size="sm">
                <Link href="/import/new">New Import</Link>
            </Button>
            <div className="grid grid-cols-4 gap-4 mt-8">
                {imports.map((i) => (
                    <ImportCard key={i.id} importRecord={i} />
                ))}
            </div>
        </div>
    );
}
