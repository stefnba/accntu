import Link from 'next/link';

import { getUser } from '@/lib/auth';

export default async function Test() {
    await getUser();

    return (
        <div>
            Here is my Test<Link href="/">BNack</Link>
        </div>
    );
}
