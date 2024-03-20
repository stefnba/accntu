import { cookies } from 'next/headers';
import Link from 'next/link';

import { getUser } from '@/auth';

export default async function Home() {
    const user = await getUser();

    const cookiesList = cookies()
        .getAll()
        .map((cookie) => (
            <li key={cookie.name}>
                {cookie.name}: {cookie.value}
            </li>
        ));

    return (
        <div>
            Home Protected {user.id} <p>{user.email}</p>
            {JSON.stringify(user, null, 2)}
            <p>
                <Link href="/login">Login</Link>
            </p>
            <p>
                <Link href="/logout">Logout</Link>
            </p>
            <p>
                <Link href="/test">Test</Link>
            </p>
            <ul className="mt-12">{cookiesList}</ul>
        </div>
    );
}
